#!/bin/bash
set -eu

# Validate Prisma schema:
# 1. Check that publicId fields use String type with @default(uuid())
# 2. Check that publicId/public_id fields have @db.Uuid
# 3. Check that publicId/public_id fields have @unique
# 4. Check that each model has createdAt field with DateTime @default(now())
# 5. Check that each model has updatedAt field with DateTime @updatedAt
# 6. Check that each model has deletedAt field with DateTime? (optional)
# 7. Check that each model has @@index([createdAt]) and @@index([updatedAt]) and @@index([deletedAt])
# 8. Support both camelCase with @map and snake_case naming

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
  local has_deletedAt=false
  local has_createdAt_index=false
  local has_deletedAt_index=false

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

    # Check publicId/public_id field
    if [[ "$field_name" = "publicId" ]] || [[ "$field_name" = "public_id" ]]; then
      has_id=true

      # Check String type
      if ! echo "$line" | grep -q "String"; then
        echo "Error at line $current_line: $field_name field should be of type String in model $model_name"
        ((error_count++))
      fi

      # Check @unique
      if ! echo "$line" | grep -q "@unique"; then
        echo "Error at line $current_line: $field_name field should have @unique in model $model_name"
        ((error_count++))
      fi

      # Check @db.Uuid
      if ! echo "$line" | grep -q "@db\.Uuid"; then
        echo "Error at line $current_line: $field_name field should have @db.Uuid in model $model_name"
        ((error_count++))
      fi

      # Check default value
      if ! echo "$line" | grep -q "@default(uuid())" && ! echo "$line" | grep -q '@default(dbgenerated("gen_random_uuid()"))'; then
        echo "Error at line $current_line: $field_name field should have @default(uuid()) or @default(dbgenerated(\"gen_random_uuid()\")) in model $model_name"
        ((error_count++))
      fi

      # Check @map for camelCase
      if [[ "$field_name" = "publicId" ]] && ! echo "$line" | grep -q '@map("public_id")'; then
        echo "Warning at line $current_line: publicId field should have @map(\"public_id\") for database consistency in model $model_name"
      fi
    fi

    # Check createdAt/created_at field
    if [[ "$field_name" = "createdAt" ]] || [[ "$field_name" = "created_at" ]]; then
      has_createdAt=true

      if ! echo "$line" | grep -q "DateTime.*@default(now())"; then
        echo "Error at line $current_line: $field_name field should be of type DateTime with @default(now()) in model $model_name"
        ((error_count++))
      fi

      if [[ "$field_name" = "createdAt" ]] && ! echo "$line" | grep -q '@map("created_at")'; then
        echo "Warning at line $current_line: createdAt field should have @map(\"created_at\") for database consistency in model $model_name"
      fi
    fi

    # Check updatedAt/updated_at field
    if [[ "$field_name" = "updatedAt" ]] || [[ "$field_name" = "updated_at" ]]; then
      has_updatedAt=true

      if ! echo "$line" | grep -q "DateTime.*@updatedAt"; then
        echo "Error at line $current_line: $field_name field should be of type DateTime with @updatedAt in model $model_name"
        ((error_count++))
      fi

      if [[ "$field_name" = "updatedAt" ]] && ! echo "$line" | grep -q '@map("updated_at")'; then
        echo "Warning at line $current_line: updatedAt field should have @map(\"updated_at\") for database consistency in model $model_name"
      fi
    fi

    # Check deletedAt/deleted_at field
    if [[ "$field_name" = "deletedAt" ]] || [[ "$field_name" = "deleted_at" ]]; then
      has_deletedAt=true

      if ! echo "$line" | grep -q "DateTime?"; then
        echo "Error at line $current_line: $field_name field should be of type DateTime? (optional) in model $model_name"
        ((error_count++))
      fi
    fi

    # Check for @@index directives
    if echo "$line" | grep -q "@@index"; then
      # Check for createdAt index (both camelCase and snake_case)
      if echo "$line" | grep -q "@@index.*\[createdAt\]" || echo "$line" | grep -q "@@index.*\[created_at\]"; then
        has_createdAt_index=true
      fi

      # Check for deletedAt index (both camelCase and snake_case)
      if echo "$line" | grep -q "@@index.*\[deletedAt\]" || echo "$line" | grep -q "@@index.*\[deleted_at\]"; then
        has_deletedAt_index=true
      fi
    fi
  done <<<"$model_content"

  # Check if required fields exist
  if [ "$has_id" = false ]; then
    echo "Error: Model $model_name is missing required field 'publicId' or 'public_id' with @unique"
    ((error_count++))
  fi

  if [ "$has_createdAt" = false ]; then
    echo "Error: Model $model_name is missing required field 'createdAt' or 'created_at'"
    ((error_count++))
  fi

  if [ "$has_updatedAt" = false ]; then
    echo "Error: Model $model_name is missing required field 'updatedAt' or 'updated_at'"
    ((error_count++))
  fi

  if [ "$has_deletedAt" = false ]; then
    echo "Error: Model $model_name is missing required field 'deletedAt' or 'deleted_at'"
    ((error_count++))
  fi

  # Check if required indexes exist
  if [ "$has_createdAt_index" = false ]; then
    echo "Error: Model $model_name is missing required index @@index([createdAt]) or @@index([created_at])"
    ((error_count++))
  fi

  if [ "$has_deletedAt_index" = false ]; then
    echo "Error: Model $model_name is missing required index @@index([deletedAt]) or @@index([deleted_at])"
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
