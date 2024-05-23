#ifndef COMMON_TYPES_CR_CUT_H_
#define COMMON_TYPES_CR_CUT_H_

// Geometry utilities
// 3D Point, Vector, & Plane
// Defines several mathematical relationships between the three
struct Vector3;

struct Point3 {
	Point3() = default;
	explicit Point3(Vector3 vec);
	Point3(float xx, float yy, float zz) : x{ xx }, y{ yy }, z{ zz } { }
    float x{ 0.0f };
    float y{ 0.0f };
    float z{ 0.0f };
};

struct Vector3 {
	Vector3() = default;
	explicit Vector3(Point3 point) : x{ point.x }, y{ point.y }, z{ point.z } { }
	Vector3(float xx, float yy, float zz) : x{ xx }, y{ yy }, z{ zz } { }
	float x{ 0.f };
	float y{ 0.f };
	float z{ 0.f };
};

// Definition of Vector3 must be seen before this can be defined
inline Point3::Point3(Vector3 vec) : x{ vec.x }, y{ vec.y }, z{ vec.z } { }

struct Plane3 {
	Plane3() = default;
	Plane3(float x, float y, float z, float intercept_) : normal{ x, y, z }, intercept{ intercept_ } { }
	Plane3(Vector3 normal_, float intercept_) : normal{ normal_ }, intercept{ intercept_ } { }
	Vector3 normal;
	float intercept{ 0.f };
};

inline bool operator==(const Point3& lhs, const Point3& rhs) {
    return lhs.x == rhs.x && lhs.y == rhs.y && lhs.z == rhs.z;
}

inline bool operator!=(const Point3& lhs, const Point3& rhs) {
    return !(lhs == rhs);
}

//inline Point3 operator+(const Point3& lhs, const Point3& rhs) {
//	return Point3{ lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z };
//}
//
//inline Point3 operator+=(const Point3& lhs, const Point3& rhs) {
//	return lhs + rhs;
//}

//inline Point3 operator-(const Point3& lhs, const Point3& rhs) {
//	return Point3{ lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z };
//}
//
//inline Point3 operator-=(const Point3& lhs, const Point3& rhs) {
//	return lhs - rhs;
//}

// Adding/subtracting points yeilds Vectors

inline Vector3 operator+(const Point3& lhs, const Point3& rhs) {
	return Vector3{ lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z };
}

inline Vector3 operator+=(const Point3& lhs, const Point3& rhs) {
	return lhs + rhs;
}

inline Vector3 operator-(const Point3 lhs, const Point3 rhs) {
	return Vector3{ lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z };
}

inline Vector3 operator-=(const Point3& lhs, const Point3& rhs) {
	return lhs - rhs;
}

// A point plus a displacement (Vector) yields another point

inline Point3 operator+(const Point3& lhs, const Vector3& rhs) {
	return Point3{ lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z };
}

inline Point3 operator+(const Vector3& lhs, const Point3& rhs) {
	return rhs + lhs;
}

inline Point3 operator+=(const Point3& lhs, const Vector3& rhs) {
	return rhs + lhs;
}

inline Point3 operator-(const Point3& lhs, const Vector3& rhs) {
	return Point3{ lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z };
}

//inline Point3 operator-(const Vector3& lhs, const Point3& rhs) {
//	return rhs - lhs;		// What makes sense here? Perhaps nothing.
//}

inline Point3 operator-=(const Point3& lhs, const Vector3& rhs) {
	return rhs + lhs;
}

inline float GetAxisValue(const Point3 point, char c) {
	if (c == 'x' || c == 'X') { return point.x; }
	else if (c == 'y' || c == 'Y') { return point.y; }
	else if (c == 'z' || c == 'Z') { return point.z; }
	throw std::runtime_error{"Axis not found."};
}

inline float GetAxisValue(const Vector3 point, char c) {
	if (c == 'x' || c == 'X') { return point.x; }
	else if (c == 'y' || c == 'Y') { return point.y; }
	else if (c == 'z' || c == 'Z') { return point.z; }
	throw std::runtime_error{ "Axis not found." };
}

inline float Distance(const Point3 a, const Point3 b) {
    auto dx = (b.x - a.x);
    auto dy = (b.y - a.y);
    auto dz = (b.z - a.z);
    return abs(sqrtf(dx * dx + dy * dy + dz * dz));
}

//Vector3 CrossProduct(const Vector3 a, const Vector3 b);
//Plane3 GetPlane(const Point3 a, const Point3 b, const Point3 c);
//Plane3 GetPlane(const Vector3 normalVector, const Point3 anyPointOnPlane);

inline Vector3 CrossProduct(const Vector3 a, const Vector3 b) {
	return { a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x };
}

// This will calculate the intercept for you given any point that lies on the plane
inline Plane3 GetPlane(const Vector3 normalVector, const Point3 anyPointOnPlane) {
	const auto intercept = normalVector.x * anyPointOnPlane.x +
		normalVector.y * anyPointOnPlane.y + normalVector.z * anyPointOnPlane.z;
	return { normalVector, intercept };
}

inline Plane3 GetPlane(const Point3 a, const Point3 b, const Point3 c) {
	auto xProduct = CrossProduct(b - a, c - a);
	if (xProduct.x * xProduct.x + xProduct.y * xProduct.y + xProduct.z * xProduct.z == 0) {
		throw std::runtime_error{ "No unique plane found." };
	}
	return GetPlane(xProduct, a);
}

// This function checks pointInQuestion to see if it is surrounded by the other three points.
// I.e. points A, B, & C create a triangle, which contains pointInQuestion.
// Points exactly on the triangle perimeter return false, which also implies that 4 colinear points returns false as well.
// This function will calculate six vectors (three pairs) and three cross products.
// Vectors are paired based off of sharing the same origin point.
// Ex. A to B is crossed with A to Q (pointInQuestion)
// This is repeated for all three points with the sum of the three perimeter vectors being Vector3{0, 0, 0}
// (Clockwise or counter-clockwise direction are both fine.)
// (Each point {A, B, C} should appear exactly once as both a destination and origin point for the perimeter vectors.)
// Finally, this function will examine the sign of the Z-component of these vectors to see if they're going into or out of the plane.
// The signs will be the same for all three cross-products if pointInQuestion is contained. (Which sign depends on order of operands.)
// A mix of signs indicates that pointInQuestion lies outside of the triangle defined by points A, B, & C.
inline bool PointIsSurrounded(const Point3 pointInQuestion, const Point3 a, const Point3 b, const Point3 c) {
	const auto aToB = b - a;
	const auto bToC = c - b;
	const auto cToA = a - c;
	const auto aToQ = pointInQuestion - a;
	const auto bToQ = pointInQuestion - b;
	const auto cToQ = pointInQuestion - c;
	const auto abXaq = CrossProduct(aToB, aToQ);
	const auto bcXbq = CrossProduct(bToC, bToQ);
	const auto caXcq = CrossProduct(cToA, cToQ);

	// Return true if all cross products have the same sign for their Z-component (all positive OR all negative).
	return ((abXaq.z > 0) && (bcXbq.z > 0) && (caXcq.z > 0)) || ((abXaq.z < 0) && (bcXbq.z < 0) && (caXcq.z < 0));
}

// GRBL State
// Where possible, enums correspond to the GCode value that represents that state

enum class MACHINE_STATE {
	IDLE,
	RUN,
	HOLD,
	HOME,
	ALARM,
	CHECK,
	LOCKED_WITH_ALARM
};

// Remove '.' from 38.x
enum class MOTION_MODE {
	RAPID = 0,
	LINEAR = 1,
	CW_ARC = 2,
	CCW_ARC = 3,
	PROBE_UNTIL_CONTACT_WITH_ALARM = 382,
	PROBE_UNTIL_CONTACT_NO_ALARM = 383,
	PROBE_UNTIL_CLEAR_WITH_ALARM = 384,
	PROBE_UNTIL_CLEAR_WITH_NO_ALARM = 385,
	BLOCK = 80
};

enum class COORDINATE_SYSTEM {
	G54 = 54,
	G55 = 55,
	G56 = 56,
	G57 = 57,
	G58 = 58,
	G59 = 59
};

enum class PLANE_SELECT {
	XY = 17,
	XZ = 18,
	YZ = 19
};

enum class UNIT_MODE {
	INCHES = 20,
	MILLIMETERS = 21
};

enum class DISTANCE_MODE {
	ABSOLUTE_MOTION = 90,
	RELATIVE_MOTION = 91
};

enum class FEEDRATE_MODE {
	MINUTES_PER_UNIT = 93,
	UNITS_PER_MINUTE = 94
};

enum class SPINDLE_STATE {
	CW = 3,
	CCW = 4,
	DISABLED = 5
};

#endif
