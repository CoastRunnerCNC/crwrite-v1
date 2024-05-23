#include <iostream>

void print_usage()
{
    std::cerr << "Usage: " << std::endl << std::endl;
    std::cerr << "MillUtil -execute <program.crproj>" << std::endl;
    std::cerr << "MillUtil -328p <328p_firmware.hex>" << std::endl;
    std::cerr << "MillUtil -64m1 <64m1_firmware.hex>" << std::endl;
    std::cerr << std::endl;
}

int main(int argc, char* const argv[])
{
    if (argc < 2)
    {
        print_usage();
        return 0;
    }

    if (std::string(argv[0]) == "-execute")
    {

    }
    else if (std::string(argv[0]) == "-328p")
    {

    }
    else if (std::string(argv[0]) == "-64m1")
    {

    }
    
    print_usage();
    return 0;
}
