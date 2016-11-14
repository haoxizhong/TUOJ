EXE = helloworld \
	  safe_exec \
	  sandbox_exec 

target:$(EXE)

helloworld:helloworld.cpp
	g++ helloworld.cpp -o helloworld -g -Wall

safe_exec:safe_exec.cpp
	g++ safe_exec.cpp -o safe_exec -g -Wall

sandbox_exec:sandbox_exec.cpp sandbox.cpp filter.cpp sandbox.h filter.h configure.h
	g++ sandbox_exec.cpp sandbox.cpp filter.cpp -o sandbox_exec -g -Wall

clean:
	rm $(EXE)
