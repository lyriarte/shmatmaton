SOURCES =  \
	main.js \
	matrix.js

DESTINATION = ../../shmatmaton

TARGET = $(DESTINATION)/shmatmaton.js

$(TARGET): $(SOURCES)
	cat $(SOURCES) > $(TARGET)

all: $(TARGET)

node: all
	echo "exports.shmatmaton = shmatmaton;" >> $(TARGET)

clean:
	rm $(TARGET)
