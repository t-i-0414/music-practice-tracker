#!/bin/bash
set -euo pipefail

# Validate Prisma schema:
# 1. Check that @id fields use String type with @default(uuid())
# 2. Check that @id attribute is only applied to fields named "id"
# 3. Check that each model has createdAt field with DateTime @default(now())
# 4. Check that each model has updatedAt field with DateTime @updatedAt

error_count=0

# Check if file exists
if [ ! -f "$1" ]; then
  echo "Error: File $1 not found"
  exit 1
fi

# Function to validate a model
validate_model() {
  local model_name=$1
  local model_content=$2
  local model_start_line=$3

  local has_id=false
  local has_createdAt=false
  local has_updatedAt=false

  # Process each line in the model
  local line_offset=0
  while IFS= read -r line; do
    local current_line=$((model_start_line + line_offset))
    ((line_offset++))

    # Skip empty lines and comments
    if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*// ]]; then
      continue
    fi

    # Extract field name (first word of the line)
    field_name=$(echo "$line" | awk '{print $1}')

    # Check id field
    if [ "$field_name" = "id" ]; then
      has_id=true

      # Check if it has @id attribute
      if ! echo "$line" | grep -q "@id"; then
        echo "Error at line $current_line: id field should have @id attribute in model $model_name"
        ((error_count++))
      fi

      # Check if it's String type
      if ! echo "$line" | grep -q "String"; then
        echo "Error at line $current_line: id field should be of type String in model $model_name"
        ((error_count++))
      fi

      # Check if it has @db.Uuid
      if ! echo "$line" | grep -q "@db\.Uuid"; then
        echo "Error at line $current_line: id field should have @db.Uuid in model $model_name"
        ((error_count++))
      fi

      # Check for valid default value
      if ! echo "$line" | grep -q "@default(uuid())" && ! echo "$line" | grep -q '@default(dbgenerated("gen_random_uuid()"))'; then
        echo "Error at line $current_line: id field should have @default(uuid()) or @default(dbgenerated(\"gen_random_uuid()\")) in model $model_name"
        ((error_count++))
      fi
    fi

    # Check if @id is used on non-id fields
    if [ "$field_name" != "id" ] && echo "$line" | grep -q "@id"; then
      echo "Error at line $current_line: @id attribute should only be used on fields named 'id', but found on field '$field_name' in model $model_name"
      ((error_count++))
    fi

    # Check for composite id (@@id)
    if echo "$line" | grep -q "@@id"; then
      echo "Error at line $current_line: Composite primary keys (@@id) are not allowed. Use a single 'id' field with @id instead in model $model_name"
      ((error_count++))
    fi

    # Check createdAt fields
    if [ "$field_name" = "createdAt" ]; then
      has_createdAt=true

      # Check if it's DateTime type with @default(now())
      if ! echo "$line" | grep -q "DateTime.*@default(now())"; then
        echo "Error at line $current_line: createdAt field should be of type DateTime with @default(now()) in model $model_name"
        ((error_count++))
      fi
    fi

    # Check updatedAt fields
    if [ "$field_name" = "updatedAt" ]; then
      has_updatedAt=true

      # Check if it's DateTime type with @updatedAt
      if ! echo "$line" | grep -q "DateTime.*@updatedAt"; then
        echo "Error at line $current_line: updatedAt field should be of type DateTime with @updatedAt in model $model_name"
        ((error_count++))
      fi
    fi
  done <<<"$model_content"

  # Check if required fields exist
  if [ "$has_id" = false ]; then
    echo "Error: Model $model_name is missing required field 'id' with @id"
    ((error_count++))
  fi

  if [ "$has_createdAt" = false ]; then
    echo "Error: Model $model_name is missing required field 'createdAt'"
    ((error_count++))
  fi

  if [ "$has_updatedAt" = false ]; then
    echo "Error: Model $model_name is missing required field 'updatedAt'"
    ((error_count++))
  fi
}

# Read file and extract models
current_model=""
model_content=""
model_start_line=0
line_num=0
in_model=false

while IFS= read -r line; do
  ((line_num++))

  # Check if this is a model declaration
  if [[ "$line" =~ ^model[[:space:]]+([[:alnum:]_]+)[[:space:]]*\{ ]]; then
    # If we were already in a model, validate it first
    if [ "$in_model" = true ] && [ -n "$current_model" ]; then
      validate_model "$current_model" "$model_content" "$model_start_line"
    fi

    # Start new model
    current_model="${BASH_REMATCH[1]}"
    model_content=""
    model_start_line=$((line_num + 1))
    in_model=true
  elif [ "$in_model" = true ]; then
    # Check if model ends
    if [[ "$line" =~ ^[[:space:]]*\}[[:space:]]*$ ]]; then
      # Validate the current model
      validate_model "$current_model" "$model_content" "$model_start_line"
      in_model=false
      current_model=""
      model_content=""
    else
      # Add line to model content
      model_content+="$line"$'\n'
    fi
  fi
done <"$1"

# Handle case where last model doesn't have a closing brace on a separate line
if [ "$in_model" = true ] && [ -n "$current_model" ]; then
  validate_model "$current_model" "$model_content" "$model_start_line"
fi

if [ $error_count -gt 0 ]; then
  echo "Found $error_count errors in Prisma schema"
  exit 1
fi

echo "Prisma schema validation passed"
exit 0
