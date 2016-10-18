#include <iostream>

int main() {
	int a, b;
	std::cin >> a >> b;
	for (int i = 0; i < 1000000000; ++ i) {
		int c = a - b;
	}
	std::cout << a + b << std::endl;
}
