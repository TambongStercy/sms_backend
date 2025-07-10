#!/bin/bash

# School Management System API - Dynamic Endpoint Tester
# This script uses DYNAMIC ID extraction from the API instead of hardcoded values

API_URL="http://localhost:4000/api/v1"
LOG_FILE="api-test-corrected-results.log"

# Utility functions for colored output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS="✅"
FAIL="❌"
SKIP="⚠️"

# Clear log file
> "$LOG_FILE"

# Store tokens for each user role
declare -A TOKENS

echo -e "\n${YELLOW}Logging in as all user roles...${NC}\n"

# Login function
login_user() {
  local email="$1"
  local password="$2"
  local role="$3"
  local login_resp
  login_resp=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")
  local token
  token=$(echo "$login_resp" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  if [[ -n "$token" ]]; then
    TOKENS[$role]="$token"
    echo -e "${GREEN}$PASS Logged in as $role${NC}"
    echo "[LOGIN $role] $login_resp" >> "$LOG_FILE"
  else
    echo -e "${RED}$FAIL Failed to log in as $role${NC}"
    echo "[LOGIN $role] $login_resp" >> "$LOG_FILE"
  fi
}

# Seeded user credentials (from comprehensive-test-seed.ts)
login_user "super.manager@school.com" "password123" "SUPER_MANAGER"
login_user "principal@school.com" "password123" "PRINCIPAL"
login_user "vp@school.com" "password123" "VICE_PRINCIPAL"
login_user "bursar@school.com" "password123" "BURSAR"
login_user "sdm@school.com" "password123" "DISCIPLINE_MASTER"
login_user "alice.math@school.com" "password123" "TEACHER_MATH"
login_user "grace.parent@gmail.com" "password123" "PARENT1"

# =============================================================================
# DYNAMIC ID EXTRACTION FUNCTION
# =============================================================================
extract_dynamic_ids() {
    echo -e "\n${YELLOW}🔍 Extracting dynamic IDs from database...${NC}"
    
    # Get current academic year ID
    ACADEMIC_YEAR_RESPONSE=$(curl -s -X GET "$API_URL/academic-years/current" -H "Authorization: Bearer ${TOKENS[SUPER_MANAGER]}")
    CURRENT_ACADEMIC_YEAR_ID=$(echo "$ACADEMIC_YEAR_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    # Get classes
    CLASSES_RESPONSE=$(curl -s -X GET "$API_URL/classes" -H "Authorization: Bearer ${TOKENS[SUPER_MANAGER]}")
    FORM1_CLASS_ID=$(echo "$CLASSES_RESPONSE" | grep -B2 -A2 '"name":"FORM 1"' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    FORM2_CLASS_ID=$(echo "$CLASSES_RESPONSE" | grep -B2 -A2 '"name":"FORM 2"' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    # Get subclasses 
    SUBCLASSES_RESPONSE=$(curl -s -X GET "$API_URL/classes/$FORM1_CLASS_ID/subclasses" -H "Authorization: Bearer ${TOKENS[SUPER_MANAGER]}")
    SUBCLASS_ID=$(echo "$SUBCLASSES_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    # Get subjects
    SUBJECTS_RESPONSE=$(curl -s -X GET "$API_URL/subjects" -H "Authorization: Bearer ${TOKENS[SUPER_MANAGER]}")
    MATH_SUBJECT_ID=$(echo "$SUBJECTS_RESPONSE" | grep -B2 -A2 '"name":"Mathematics"' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    # Get existing students (first few for testing)
    STUDENTS_RESPONSE=$(curl -s -X GET "$API_URL/students?limit=5" -H "Authorization: Bearer ${TOKENS[SUPER_MANAGER]}")
    STUDENT_ID_1=$(echo "$STUDENTS_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    STUDENT_ID_2=$(echo "$STUDENTS_RESPONSE" | grep -o '"id":[0-9]*' | sed -n '2p' | cut -d':' -f2)
    
    # Get enrollment data for fee creation
    FIRST_STUDENT_DETAIL=$(curl -s -X GET "$API_URL/students/$STUDENT_ID_1" -H "Authorization: Bearer ${TOKENS[SUPER_MANAGER]}")
    ENROLLMENT_ID=$(echo "$FIRST_STUDENT_DETAIL" | grep -o '"enrollments":\[{"id":[0-9]*' | cut -d':' -f3)
    
    # Fallback values if extraction fails
    CURRENT_ACADEMIC_YEAR_ID=${CURRENT_ACADEMIC_YEAR_ID:-1}
    FORM1_CLASS_ID=${FORM1_CLASS_ID:-1}
    FORM2_CLASS_ID=${FORM2_CLASS_ID:-2}
    SUBCLASS_ID=${SUBCLASS_ID:-1}
    MATH_SUBJECT_ID=${MATH_SUBJECT_ID:-1}
    STUDENT_ID_1=${STUDENT_ID_1:-1}
    STUDENT_ID_2=${STUDENT_ID_2:-2}
    ENROLLMENT_ID=${ENROLLMENT_ID:-1}
    
    # Print extracted IDs for debugging
    echo "✅ Extracted Dynamic IDs:"
    echo "  - Current Academic Year: $CURRENT_ACADEMIC_YEAR_ID"
    echo "  - Form 1 Class: $FORM1_CLASS_ID"
    echo "  - Form 2 Class: $FORM2_CLASS_ID"
    echo "  - Subclass: $SUBCLASS_ID"
    echo "  - Math Subject: $MATH_SUBJECT_ID"
    echo "  - Student 1: $STUDENT_ID_1"
    echo "  - Student 2: $STUDENT_ID_2"
    echo "  - Enrollment: $ENROLLMENT_ID"
    echo ""
}

# Call the function to extract IDs before running tests
extract_dynamic_ids

# Helper to run a curl test and log results
run_test() {
  local name="$1"
  local method="$2"
  local url="$3"
  local token="$4"
  local data="$5"
  local expected_code="$6"

  local auth_header=""
  if [[ -n "$token" ]]; then
    auth_header="-H 'Authorization: Bearer $token'"
  fi

  local curl_cmd="curl -s -w '%{http_code}' -o tmp_response.txt -X $method '$url' -H 'Content-Type: application/json' $auth_header"
  if [[ -n "$data" ]]; then
    curl_cmd+=" -d '$data'"
  fi

  # Run the command
  eval $curl_cmd > tmp_status.txt
  local status_code=$(cat tmp_status.txt)
  local response=$(cat tmp_response.txt)

  # Log to file
  echo -e "\n[TEST] $name" >> "$LOG_FILE"
  echo "Request: $method $url" >> "$LOG_FILE"
  if [[ -n "$data" ]]; then echo "Data: $data" >> "$LOG_FILE"; fi
  echo "Response: $response" >> "$LOG_FILE"
  echo "Status: $status_code" >> "$LOG_FILE"

  # Print to console
  if [[ "$status_code" == "$expected_code" ]]; then
    echo -e "${GREEN}$PASS $name ($status_code)${NC}"
  else
    echo -e "${RED}$FAIL $name ($status_code)${NC}"
    FAILURES+=("$name ($status_code)")
  fi
}

# Array to track failures
FAILURES=()

echo -e "\n${YELLOW}🔐 Testing Core Authentication...${NC}"
run_test "Login with Email" "POST" "$API_URL/auth/login" "" '{"email":"super.manager@school.com","password":"password123"}' "200"
run_test "Get Profile" "GET" "$API_URL/auth/me" "${TOKENS[SUPER_MANAGER]}" "" "200"

echo -e "\n${YELLOW}👨‍👩‍👧‍👦 Testing Parent Portal (Dynamic IDs)...${NC}"
run_test "Parent Dashboard" "GET" "$API_URL/parents/dashboard" "${TOKENS[PARENT1]}" "" "200"

# Extract child ID dynamically from parent dashboard
CHILD_ID=$(grep 'Parent Dashboard' "$LOG_FILE" -A 20 | grep -o 'children":\[{"id":[0-9]*' | head -1 | grep -o '[0-9]*$')
if [ -z "$CHILD_ID" ]; then
    echo "⚠️ Could not extract CHILD_ID for PARENT1, using fallback $STUDENT_ID_1."
    CHILD_ID=$STUDENT_ID_1
else
    echo "✅ Extracted CHILD_ID for PARENT1: $CHILD_ID"
fi

run_test "Get Child Details (Dynamic)" "GET" "$API_URL/parents/children/$CHILD_ID" "${TOKENS[PARENT1]}" "" "200"
run_test "Get Child Details with Academic Year" "GET" "$API_URL/parents/children/$CHILD_ID?academicYearId=$CURRENT_ACADEMIC_YEAR_ID" "${TOKENS[PARENT1]}" "" "200"

echo -e "\n${YELLOW}🧩 Testing Quiz System (Dynamic IDs)...${NC}"
run_test "Create Quiz (Dynamic Subject/Class IDs)" "POST" "$API_URL/quiz" "${TOKENS[TEACHER_MATH]}" "{\"title\":\"Math Quiz Dynamic\",\"description\":\"Basic algebra quiz with dynamic IDs\",\"subjectId\":$MATH_SUBJECT_ID,\"classIds\":[$FORM1_CLASS_ID,$FORM2_CLASS_ID],\"timeLimit\":30,\"totalMarks\":10,\"questions\":[{\"questionText\":\"What is 2+2?\",\"questionType\":\"MCQ\",\"options\":[\"2\",\"3\",\"4\",\"5\"],\"correctAnswer\":\"4\",\"marks\":2}]}" "201"

echo -e "\n${YELLOW}💰 Testing Bursar (Dynamic IDs)...${NC}"
run_test "Create Fee (Dynamic Enrollment ID)" "POST" "$API_URL/fees" "${TOKENS[BURSAR]}" "{\"enrollmentId\":$ENROLLMENT_ID,\"amountExpected\":75000,\"feeType\":\"School Fees\",\"description\":\"Academic year fees with dynamic enrollment\",\"dueDate\":\"2024-12-31\"}" "201"

echo -e "\n${YELLOW}👨‍🎓 Testing Student Management (Dynamic IDs)...${NC}"
run_test "Get Student by ID (Dynamic)" "GET" "$API_URL/students/$STUDENT_ID_1" "${TOKENS[PRINCIPAL]}" "" "200"
run_test "Get Students by Subclass (Dynamic)" "GET" "$API_URL/students/subclass/$SUBCLASS_ID" "${TOKENS[PRINCIPAL]}" "" "200"

echo -e "\n${YELLOW}📅 Testing Academic Year (Dynamic IDs)...${NC}"
run_test "Get Academic Year by ID (Dynamic)" "GET" "$API_URL/academic-years/$CURRENT_ACADEMIC_YEAR_ID" "${TOKENS[SUPER_MANAGER]}" "" "200"
run_test "Get Current Academic Year" "GET" "$API_URL/academic-years/current" "${TOKENS[SUPER_MANAGER]}" "" "200"

echo -e "\n${YELLOW}👨‍🏫 Testing Teacher Portal...${NC}"
run_test "Get My Subjects (Teacher)" "GET" "$API_URL/teachers/me/subjects" "${TOKENS[TEACHER_MATH]}" "" "200"
run_test "Get My Students (Teacher)" "GET" "$API_URL/teachers/me/students" "${TOKENS[TEACHER_MATH]}" "" "200"
run_test "Get My Dashboard (Teacher)" "GET" "$API_URL/teachers/me/dashboard" "${TOKENS[TEACHER_MATH]}" "" "200"

echo -e "\n${YELLOW}📊 Testing Basic Data Access...${NC}"
run_test "Get All Students" "GET" "$API_URL/students" "${TOKENS[PRINCIPAL]}" "" "200"
run_test "Get All Classes" "GET" "$API_URL/classes" "${TOKENS[PRINCIPAL]}" "" "200"
run_test "Get All Subjects" "GET" "$API_URL/subjects" "${TOKENS[PRINCIPAL]}" "" "200"

echo -e "\n${YELLOW}🎓 Testing Vice Principal Enhanced Features...${NC}"
run_test "VP Enhanced Dashboard" "GET" "$API_URL/vice-principal/dashboard" "${TOKENS[VICE_PRINCIPAL]}" "" "200"
run_test "VP Dashboard with Academic Year" "GET" "$API_URL/vice-principal/dashboard?academicYearId=$CURRENT_ACADEMIC_YEAR_ID" "${TOKENS[VICE_PRINCIPAL]}" "" "200"
run_test "Student Management Overview" "GET" "$API_URL/vice-principal/student-management" "${TOKENS[VICE_PRINCIPAL]}" "" "200"

echo -e "\n${YELLOW}💰 Testing Bursar Enhanced Features...${NC}"
run_test "Bursar Dashboard" "GET" "$API_URL/bursar/dashboard" "${TOKENS[BURSAR]}" "" "200"
run_test "Get Available Parents" "GET" "$API_URL/bursar/available-parents" "${TOKENS[BURSAR]}" "" "200"

echo -e "\n${YELLOW}🔒 Testing Authorization...${NC}"
run_test "Unauthorized Access (No Token)" "GET" "$API_URL/users" "" "" "401"
run_test "Teacher Access to Admin Endpoint" "GET" "$API_URL/users" "${TOKENS[TEACHER_MATH]}" "" "403"

# Print summary
echo -e "\n${YELLOW}Test Summary:${NC}"
echo -e "Total endpoints tested: $(( $(grep -c '\[TEST\]' "$LOG_FILE") ))"
echo -e "Failures: ${#FAILURES[@]}"
if [[ ${#FAILURES[@]} -gt 0 ]]; then
  echo -e "${RED}Failed endpoints:${NC}"
  for fail in "${FAILURES[@]}"; do
    echo -e "  $FAIL $fail"
  done
else
  echo -e "${GREEN}All endpoints passed!${NC}"
fi

echo -e "\n${GREEN}✅ Dynamic endpoint testing completed successfully!${NC}"
echo -e "📝 Results logged to: $LOG_FILE"

# Clean up
test -f tmp_response.txt && rm tmp_response.txt
test -f tmp_status.txt && rm tmp_status.txt 