#!/bin/bash
# filepath: /home/green/Documents/ICP-WCHL-25/deCentra/scripts/generate-candid.sh

# Install candid-extractor if needed
# bash ./scripts/install-cargo-extractor.sh

# Function to generate candid for a specific canister
generate_candid_for_canister() {
  local canister=$1
  echo "Generating Candid for canister: $canister"
  
  # Ensure declarations directory exists
  mkdir -p src/$canister
  
  # Build the Wasm for the canister
  cargo build --target wasm32-unknown-unknown --release --package $canister
  
  if [ $? -ne 0 ]; then
    echo "Error: Failed to build Wasm for canister $canister"
    return 1
  fi
  
  # Extract the Candid interface - FIX: Added the canister name and full output path
  candid-extractor target/wasm32-unknown-unknown/release/$canister.wasm > src/$canister/$canister.did
  
  if [ $? -ne 0 ]; then
    echo "Error: Failed to extract Candid interface for canister $canister"
    return 1
  fi
  
  echo "Successfully generated Candid for $canister"
}

# Check if a specific canister was requested
if [ "$1" != "" ]; then
  # Verify the canister exists in dfx.json
  if jq -e ".canisters.\"$1\"" dfx.json > /dev/null 2>&1; then
    generate_candid_for_canister "$1"
  else
    echo "Error: Canister '$1' not found in dfx.json"
    exit 1
  fi
else
  # No canister specified, generate for all Rust canisters
  canister_names=$(jq -r '.canisters | to_entries[] | select(.value.type == "custom" and .value.package) | .key' dfx.json)
  
  for canister in $canister_names; do
    generate_candid_for_canister "$canister"
  done
fi

# Always refresh the did files
if [ "$1" != "" ]; then
  # Generate declarations for the specific canister
  dfx generate "$1"
else
  # Generate declarations for all canisters
  dfx generate
fi
