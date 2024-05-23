// A common list of headers to be used across most all files
// Theoretically, this could help with precompiled headers since the header starts the same for all files that #include this
// If moving to C++20, this should be replaced by using modules in each file, since modules are much faster than headers

#include <algorithm>
#include <atomic>
#include <cassert>
#include <cctype>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <deque>
#include <exception>
#include <fstream>
#include <ios>
#include <iostream>
#include <istream>
#include <iterator>
#include <limits.h>
#include <list>
#include <locale>
#include <map>
#include <memory>
#include <mutex>
#include <optional>
#include <ostream>
#include <queue>
#include <regex>
#include <sstream>
#include <string>
#include <thread>
#include <unordered_map>
#include <utility>
#include <vector>

#include <tl/optional.hpp>

#ifdef _WIN32
#include <windows.h>
#include <initguid.h>
#include <setupapi.h>
#include <shellapi.h>
#undef max
#undef min
#endif