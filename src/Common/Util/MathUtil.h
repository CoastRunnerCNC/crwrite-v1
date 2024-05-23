#pragma once

#include <algorithm>
#include <cmath>

class MathUtil
{
public:
    static int Percentage(const size_t finished, const size_t total) noexcept
    {
        if (total == 0) { return 0; }
        if (finished >= total) { return 100; }

        return (std::min)(99, (int)(100 * ((double)finished + 1.0) / total));
    }

    static double RoundDown(const double value, const uint8_t numDecimalPlaces) noexcept
    {
        const uint32_t multiply = (uint32_t)std::pow(10, (uint32_t)numDecimalPlaces);
        return std::floor(value * multiply) / multiply;
    }
};