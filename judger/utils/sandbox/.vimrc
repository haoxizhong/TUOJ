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
