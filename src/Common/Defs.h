#pragma once

#include <memory>

// Unifies the sleep function between platforms to the windows standard Sleep which takes milliseconds

namespace unique
{
	template<typename T, typename... Args>
	std::unique_ptr<T> make_unique(Args&&... args) {
		return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
	}
}

#if defined _WIN32
	#include <Windows.h>
#elif defined __APPLE__ || defined __linux__
	#include <unistd.h>
	#define Sleep(X) usleep(X * 1000)

#if defined __APPLE__
	#include <mach/mach_time.h>
	#define GetTickCount() mach_absolute_time()
#endif
#endif
