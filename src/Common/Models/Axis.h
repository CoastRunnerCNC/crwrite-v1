#pragma once

#include "Common/CommonHeaders.h"

// Represent an axis and provide helper functions
enum class EAxis
{
    X,
    Y,
    Z
};

namespace Axis
{
    static std::string ToString(const EAxis axis)
    {
        switch (axis)
        {
            case EAxis::X: return "X";
            case EAxis::Y: return "Y";
            case EAxis::Z: return "Z";
        }

        throw std::exception();
    }

    static EAxis FromString(const std::string& axisStr)
    {
        if (axisStr == "X") { return EAxis::X; }
        if (axisStr == "Y") { return EAxis::Y; }
        if (axisStr == "Z") { return EAxis::Z; }

        throw std::exception();
    }
}