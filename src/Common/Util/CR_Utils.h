#include <string>
#include <type_traits>

template<typename ScopedEnum>
std::underlying_type_t<ScopedEnum> GetEnum(ScopedEnum val) {
	return static_cast<std::underlying_type_t<ScopedEnum>>(val);
}

template<typename ScopedEnum>
std::string EnumVal(ScopedEnum val) {
	return std::to_string(GetEnum(val));
}