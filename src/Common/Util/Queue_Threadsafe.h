#ifndef QUEUE_THREADSAFE_CLASS
#define QUEUE_THREADSAFE_CLASS

#include <memory>
#include <mutex>
#include <queue>

template <typename T> class QUEUE_THREADSAFE {
public:
	QUEUE_THREADSAFE() = default;
	~QUEUE_THREADSAFE() = default;
	QUEUE_THREADSAFE(const QUEUE_THREADSAFE&) = delete;				// Copies are not allowed.
	QUEUE_THREADSAFE& operator=(const QUEUE_THREADSAFE&) = delete;	// Copies are not allowed.
	QUEUE_THREADSAFE(QUEUE_THREADSAFE&&) = default;					// Move-only
	QUEUE_THREADSAFE& operator=(QUEUE_THREADSAFE&&) = default;		// Move-only

	bool empty() const noexcept { 
		auto lock = std::lock_guard<std::mutex>{ m };
		return Q.empty();
	}

	int size() const noexcept {
		auto lock = std::lock_guard<std::mutex>{ m };
		return Q.size();
	}

	//Add unique_ptr to queue
	void push(std::unique_ptr<T> val) {
		auto lock = std::lock_guard<std::mutex>{ m };	// Unlocks mutex automatically when the variable goes out of scope.
		Q.push(std::move(val));							// Add pointer to queue
	}

	// Add by value instead of pointer
	void push(T add) {
		auto val = std::make_unique<T>(add);			// Expensive operation done before locking occurs.
		auto lock = std::lock_guard<std::mutex>{ m };	// Unlocks mutex automatically when the variable goes out of scope.
		Q.push(std::move(val));							// Add pointer to queue
	}

	// Return frontmost pointer in queue and remove from queue.
	std::unique_ptr<T> load_and_pop() {
		auto val = std::unique_ptr<T>{ nullptr };		// Create unique pointer
		auto lock = std::lock_guard<std::mutex>{ m };	// Unlocks mutex automatically when the variable goes out of scope.
		if (Q.empty()) { return val; }					// Return nullptr if queue is empty.
		val = std::move(Q.front());
		Q.pop();										// Pop only after successful reading.
		return std::move(val);
	}

	// Read frontmost value into user-provided input value and remove from queue.
	bool load_and_pop(T& val) {
		auto temp = std::unique_ptr<T>{ nullptr };			// Create unique pointer
		{
			auto lock = std::lock_guard<std::mutex>{ m };	// Unlocks mutex automatically when the variable goes out of scope.
			if (Q.empty()) { return false; }				// Return nullptr if queue is empty.
			temp = std::move(Q.front());
			Q.pop();										// Pop only after successful reading.
		}
		val = *temp;										// Dereference pointer outside of lock in case the assignment is time-consuming.
		return true;
	}

private:
	std::queue<std::unique_ptr<T>> Q;		// The queue holds unique pointers 
	mutable std::mutex m;
};

#endif // !QUEUE_THREADSAFE_CLASS
