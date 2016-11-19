EXE = helloworld \
	  safe_exec \
	  sandbox_exec \
	  pause

target:$(EXE)

pause : pause.cc
	g++ pause.cc -o pause

helloworld:helloworld.cpp
	g++ helloworld.cpp -o helloworld -g -Wall

safe_exec:safe_exec.cpp
	g++ safe_exec.cpp -o safe_exec -g -Wall

sandbox_exec:sandbox_exec.cpp sandbox.cpp filter.cpp sandbox.h filter.h configure.h sandbox_exec_help.cpp sandbox_exec.h
	g++ sandbox_exec.cpp sandbox.cpp filter.cpp sandbox_exec_help.cpp -o sandbox_exec -g -Wall

clean:
	rm $(EXE)
