server:
	python -m SimpleHTTPServer

css-watch:
	@compass watch --sass-dir sass_src/ --images-dir img --css-dir css/ --relative-assets --force --no-line-comments

.PHONY: server

