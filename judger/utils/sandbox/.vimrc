set fileencodings=utf-8,ucs-bom,gb18030,gbk,gb2312,cp936
set termencoding=utf-8
set encoding=utf-8

function Compile()
		if &filetype == 'cpp'
				exec "!g++ % -o %< -g -Wall -Wextra -Wconversion"
		elseif &filetype == 'pas'
				exec "!fpc % -o %< -g"
		elseif &filetype == 'tex'
				exec "!xelatex '%'"
		elseif &filetype == 'java'
				exec "!javac %"
		elseif &filetype == 'scss'
				exec "!sass % > %<.css"
		endif
endfunction

function Debug()
		if &filetype == 'cpp' 
				exec "!gdb ./%<"
		elseif &filetype == 'tex'
				exec "!open './%<.pdf'"
		elseif &filetype == 'java'
				exec "!jdb %<"
		endif
endfunction

function Run()
		if &filetype == 'cpp'
				exec "!time ./%<"
		elseif &filetype == 'tex'
				exec "!open './%<.pdf'"
		elseif &filetype == 'java'
				exec "!java %<"
		elseif &filetype == 'ruby'
				exec "!ruby %"
		elseif &filetype == 'html'
				exec "!firefox %"
		elseif &filetype == 'php'
				exec "!php %"
		elseif &filetype == 'sh'
				exec "!bash %"
		endif
endfunction

function Special(cmd)
		let compileflag = 0
		let objectflag = 0
		for i in range(0,len(a:cmd)+1)
				let cur = a:cmd[l:i]
				if (l:cur == 'c')
						let compileflag = 1
						continue
				endif
				if (l:cur == 'o')
						let compileflag = 2
						continue
				endif
				if (l:cur == 'p')
						let compileflag += 10
						continue
				endif
				if (l:cur == 'a')
						let compileflag += 20
				endif
				if (l:cur == 'r')
						!'./%<'
				endif
				if ((l:compileflag != 0) && (l:compileflag != -1))
						if (l:compileflag == 1)
								!g++ '%' -o '%<' -g
						endif
						if (l:compileflag == 2)
								!g++ '%' -o '%<' -O2
						endif
						if (l:compileflag == 11)
								!g++ '%' -o '%<' -pg
						endif
						if (l:compileflag == 12)
								!g++ '%' -o '%<' -O2 -pg
						endif
						if (l:compileflag == 21)
								!g++ '%' -c
								let objectflag = 1
						endif
						if (l:compileflag == 22)
								!g++ '%' -O2 -c
								let objectflag = 1
						endif
						let compileflag = -1
				endif
		endfor
		if (l:objectflag == 1)
				!objdump -d '%<.o'
		endif
endfunction

set hlsearch
set mouse=a
set smartindent
set fdm=marker
set number
set tabstop=4
set softtabstop=4
syntax on
filetype plugin indent on
imap jj <esc>
map <F9> : call Compile() <CR>
map <F5> : call Debug() <CR>
map <F6> : call Run() <CR>
map <F8> : ! g++ % -o %< -O2 <CR>
map <F12> : ! subl ./% <CR>
map <F2> : ! python % <CR>
nmap <C-V> :r !pbpaste<CR><CR>
colors evening
