#pragma once

#include "Common/CommonHeaders.h"
#pragma warning(disable : 4840)

// Provides several string utility operations
class StringUtil
{
public:
	template<typename ... Args>
	static std::string Format(const std::string& format, Args ... args)
	{
		size_t size = std::snprintf(nullptr, 0, format.c_str(), args ...) + 1; // Extra space for '\0'
		std::unique_ptr<char[]> buf(new char[size]);
		std::snprintf(buf.get(), size, format.c_str(), args ...);
		return std::string(buf.get(), buf.get() + size - 1); // We don't want the '\0' inside
	}

	static bool StartsWith(const std::string& value, const std::string& beginning)
	{
		if (beginning.size() > value.size())
		{
			return false;
		}

		return std::equal(beginning.begin(), beginning.end(), value.begin());
	}

	static bool EndsWith(const std::string& value, const std::string& ending)
	{
		if (ending.size() > value.size())
		{
			return false;
		}

		return std::equal(ending.rbegin(), ending.rend(), value.rbegin());
	}

	static std::vector<std::string> Split(const std::string& str, const std::string& delimiter)
	{
		// Skip delimiters at beginning.
		std::string::size_type lastPos = str.find_first_not_of(delimiter, 0);

		// Find first delimiter.
		std::string::size_type pos = str.find_first_of(delimiter, lastPos);

		std::vector<std::string> tokens;
		while (std::string::npos != pos || std::string::npos != lastPos)
		{
			// Found a token, add it to the vector.
			tokens.push_back(str.substr(lastPos, pos - lastPos));

			// Skip delimiters.
			lastPos = str.find_first_not_of(delimiter, pos);

			// Find next delimiter.
			pos = str.find_first_of(delimiter, lastPos);
		}

		return tokens;
	}

	static std::pair<std::string, std::string> SplitOnce(const std::string& str, const std::string& delimiter)
	{
		// Skip delimiters at beginning.
		std::string::size_type lastPos = str.find_first_not_of(delimiter, 0);

		// Find first delimiter.
		std::string::size_type pos = str.find_first_of(delimiter, lastPos);

		std::string front = "";
		std::string back = "";

		if (std::string::npos != pos || std::string::npos != lastPos)
		{
			// Found a token, add it to the vector.
			front = str.substr(lastPos, pos - lastPos);

			// Skip delimiters.
			std::string::size_type backPos = str.find_first_not_of(delimiter, pos);
			if (backPos != std::string::npos)
			{
				back = str.substr(backPos);
			}
		}

		return std::make_pair<std::string>(std::move(front), std::move(back));
	}

	static std::string ToLower(const std::string& str)
	{
		std::locale loc;
		std::string output = "";

		for (auto elem : str)
		{
			output += std::tolower(elem, loc);
		}

		return output;
	}

	static std::string Trim(const std::string& s)
	{
		std::string copy = s;

		// trim from start
		copy.erase(copy.begin(), std::find_if(copy.begin(), copy.end(), [](int ch) {
			return !std::isspace(ch);
			}));

		// trim from end (in place)
		copy.erase(std::find_if(copy.rbegin(), copy.rend(), [](int ch) {
			return !std::isspace(ch) && ch != '\r' && ch != '\n';
			}).base(), copy.end());

		return copy;
	}
};
