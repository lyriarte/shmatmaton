SOURCES =  \
	main.js \
	matrix.js

DESTINATION = ../../shmatmaton

TARGET = $(DESTINATION)/shmatmaton.js

$(TARGET): $(SOURCES)
	mkdir -p $(DESTINATION)
	cat $(SOURCES) > $(TARGET)

all: $(TARGET)

node: all
	echo "exports.shmatmaton = shmatmaton;" >> $(TARGET)

clean:
	rm $(TARGET)
