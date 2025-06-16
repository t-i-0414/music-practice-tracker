#!/bin/bash

# Validate Prisma schema:
# 1. Check that @id fields use String type with @default(uuid())
# 2. Check that @id attribute is only applied to fields named "id"

error_count=0

# Check if file exists
if [ ! -f "$1" ]; then
  echo "Error: File $1 not found"
  exit 1
fi

# Check for @id fields
while IFS= read -r line_content; do
  line_num=$(echo "$line_content" | cut -d: -f1)
  line=$(echo "$line_content" | cut -d: -f2-)

  # Check if line contains @id
  if echo "$line" | grep -q "@id"; then
    # Extract field name (first word of the line)
    field_name=$(echo "$line" | awk '{print $1}')

    # Check if field name is "id"
    if [ "$field_name" != "id" ]; then
      echo "Error at line $line_num: @id attribute should only be used on fields named 'id', but found on field '$field_name'"
      ((error_count++))
    fi

    # Check if it's String type with @default(uuid())
    if ! echo "$line" | grep -q "String.*@id.*@default(uuid())" && ! echo "$line" | grep -q "String.*@default(uuid()).*@id"; then
      echo "Error at line $line_num: @id field should be of type String with @default(uuid())"
      ((error_count++))
    fi
  fi
done < <(grep -n "@id" "$1")

if [ $error_count -gt 0 ]; then
  echo "Found $error_count errors in Prisma schema"
  exit 1
fi

echo "Prisma schema validation passed"
exit 0
