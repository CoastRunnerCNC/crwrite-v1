#include "CNCMill.h"
#include "MillFinder.h"
#include <Common/Logger.h>

extern "C" {
#include <dirent.h>
#include <sys/types.h>
}

const auto subnodeMatch = std::regex{"[0-9]+-[0-9]+:[0-9]+\\.[0-9]+"};
const auto deviceMatch = std::regex{"[0-9]+-[0-9]+"};
const auto usb_root_path = std::string{"/sys/bus/usb/devices/"};

struct DirectoryHandle {
    using Type = ::DIR*;

    operator Type() noexcept { return dir_; }

    explicit DirectoryHandle(const std::string& path) noexcept
        : dir_(::opendir(path.c_str()))
    {
    }

    ~DirectoryHandle()
    {
        if (nullptr != dir_) {
            ::closedir(dir_);
            dir_ = nullptr;
        }
    }

private:
    Type dir_;
};

struct DirectoryReader {
    using File = ::dirent*;

    DirectoryReader(DirectoryHandle& dir, File& entry) noexcept
        : dir_(dir)
        , entry_(entry)
    {
    }

    ~DirectoryReader() { entry_ = ::readdir(dir_); }

private:
    DirectoryHandle& dir_;
    File& entry_;
};

auto FindUSBDevices() noexcept -> std::vector<std::string>
{
    auto output = std::vector<std::string>{};
    auto usbDir = DirectoryHandle{usb_root_path};

    if (nullptr != usbDir) {
        auto entry = ::readdir(usbDir);

        while (nullptr != entry) {
            auto reader = DirectoryReader(usbDir, entry);
            const auto name = std::string{entry->d_name};
            const auto subnode = std::regex_search(name, subnodeMatch);
            const auto device = std::regex_search(name, deviceMatch);

            if (device && (false == subnode)) { output.emplace_back(name); }
        }
    } else {
        std::cout << "Failed to open " << usb_root_path << '\n';
    }

    return output;
}

auto DetectCompatibleDevice(std::list<CNCMill>& output) noexcept -> void
{
    auto devices = std::map<std::string, std::string>{};

    for (const auto& device : FindUSBDevices()) {
        const auto path = usb_root_path + device;
        auto vendor = std::string{};
        auto product = std::string{};
        auto serialNumber = std::string{};
        auto parent = DirectoryHandle{path};

        if (nullptr == parent) { continue; }

        auto idVendor = std::ifstream(path + '/' + "idVendor");
        auto idProduct = std::ifstream(path + '/' + "idProduct");
        auto serial = std::ifstream(path + '/' + "serial");

        if (false == idVendor.is_open()) { continue; }
        if (false == idProduct.is_open()) { continue; }
        if (false == serial.is_open()) { continue; }

        std::getline(idVendor, vendor);
        std::getline(idProduct, product);
        std::getline(serial, serialNumber);

        if ("2341" != vendor) { continue; }
        if ("0043" != product) { continue; }

        auto entry = ::readdir(parent);

        while (nullptr != entry) {
            auto reader = DirectoryReader(parent, entry);
            const auto name = std::string{entry->d_name};
            const auto subnode = std::regex_search(name, subnodeMatch);

            if (subnode) {
                const auto ttyPath = path + '/' + name + "/tty/";
                auto tty = DirectoryHandle{ttyPath};

                if (nullptr != tty) {
                    auto file = ::readdir(tty);

                    while (nullptr != file) {
                        auto innerReader = DirectoryReader(tty, file);
                        const auto fileName = std::string{file->d_name};

                        if ("." == fileName) { continue; }

                        if (".." == fileName) { continue; }

                        if (nullptr != file) {
                            devices.emplace(
                                serialNumber, std::string{"/dev/" + fileName});
                        }
                    }
                }
            }
        }
    }

    for (const auto& [serial, device] : devices) {
        output.emplace_back(device, serial);
    }
}

auto MillFinder::GetAvailableCNCMills() const
    -> std::list<CNCMill>
{
    auto output = std::list<CNCMill>{};
    DetectCompatibleDevice(output);

    return output;
}
