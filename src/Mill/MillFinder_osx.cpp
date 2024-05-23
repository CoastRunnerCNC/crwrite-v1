#include "MillFinder.h"
#include <Common/Logger.h>

// TODO: Clean these up:
#include <IOKit/IOKitLib.h>
#include <IOKit/usb/IOUSBLib.h>
#include <sys/param.h>
#include <paths.h>
#include <IOKit/IOBSD.h>
#include <IOKit/serial/IOSerialKeys.h>
#include <CoreFoundation/CFNumber.h>
#include <IOKit/graphics/IOGraphicsLib.h>
#include <iomanip>

std::string GetString(const CFStringRef& stringRef)
{
	const CFIndex bufferSize = CFStringGetMaximumSizeForEncoding(CFStringGetLength(stringRef), kCFStringEncodingMacRoman) + sizeof('\0');
	std::vector<char> buffer(bufferSize);
	CFStringGetCString(stringRef, buffer.data(), bufferSize, kCFStringEncodingMacRoman);
	return std::string(buffer.begin(), buffer.end());
}

unsigned int FindValue(io_object_t device, CFStringRef key)
{
	unsigned int value = 0;

	CFTypeRef ref;
	if ((ref=IORegistryEntrySearchCFProperty(device, kIOServicePlane, key, kCFAllocatorDefault, kIORegistryIterateRecursively | kIORegistryIterateParents)))
	{
		CFNumberGetValue((CFNumberRef)ref, kCFNumberSInt32Type, &value);
		CFRelease(ref);
	}

	return value;
}

std::string FindString(io_object_t device, CFStringRef key)
{
	std::string value = "";

	CFTypeRef ref;
	if ((ref=IORegistryEntrySearchCFProperty(device, kIOServicePlane, key, kCFAllocatorDefault, kIORegistryIterateRecursively | kIORegistryIterateParents)))
	{
		value = GetString((CFStringRef)ref);
		CFRelease(ref);
	}

	return value;
}

void FindUSBDevice(io_object_t device, const std::string& path, std::list<CNCMill>& availableCNCMills)
{
	unsigned int vendorID = FindValue(device, CFSTR("idVendor"));
	unsigned int productID = FindValue(device, CFSTR("idProduct"));

	if ((vendorID == std::stoul("2341", nullptr, 16) && productID == std::stoul("43", nullptr, 16)) || (vendorID == std::stoul("1A86", nullptr, 16) && productID == std::stoul("7523", nullptr, 16)))
	{
		const std::string serialNumber = FindString(device, CFSTR(kUSBSerialNumberString));
		if (!serialNumber.empty())
		{
			availableCNCMills.push_back(CNCMill(path, serialNumber));
		}
	}
}

/*
https://developer.apple.com/library/archive/documentation/DeviceDrivers/Conceptual/AccessingHardware/AH_Finding_Devices/AH_Finding_Devices.html#//apple_ref/doc/uid/TP30000379-BAJDAJDJ
To find devices in the I/O Registry, you perform the following steps:

1. Get the I/O Kit master port to communicate with the I/O Kit.
2. Find the appropriate keys and values that sufficiently define the target device or set of devices.
3. Use the key-value pairs to create a matching dictionary.
4. Use the matching dictionary to look up matching devices in the I/O Registry.
*/
std::list<CNCMill> MillFinder::GetAvailableCNCMills() const
{
	std::list<CNCMill> availableCNCMills;

	/* set up a matching dictionary for the class */
	CFMutableDictionaryRef matchingDict = IOServiceMatching(kIOSerialBSDServiceValue);
	if (matchingDict == NULL)
	{
		return availableCNCMills; // fail
	}

	/* Now we have a dictionary, get an iterator.*/
	io_iterator_t iter;
	kern_return_t kr = IOServiceGetMatchingServices(kIOMasterPortDefault, matchingDict, &iter);
	if (kr != KERN_SUCCESS)
	{
		return availableCNCMills;
	}

	/* iterate */
	io_service_t device;
	while ((device = IOIteratorNext(iter)))
	{
		CFStringRef pathRef = (CFStringRef)IORegistryEntryCreateCFProperty(device, CFSTR("IOCalloutDevice"), kCFAllocatorDefault, 0);
		const std::string path = GetString(pathRef);
		CFRelease(pathRef);

		if (path.rfind("/dev/cu.usbmodem", 0) == 0)
		{
			FindUSBDevice(device, path, availableCNCMills);
		}

		IOObjectRelease(device);
	}

	IOObjectRelease(iter);

	return availableCNCMills;
}
