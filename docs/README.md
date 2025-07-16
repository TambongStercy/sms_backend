# School Management System Documentation

Welcome to the School Management System documentation. This folder contains comprehensive guides for developers, administrators, and users.

## 📚 Available Documentation

### Core Systems

- **[Student Enrollment System](./STUDENT_ENROLLMENT_SYSTEM.md)** - Complete guide to the two-level enrollment system
- **[Enrollment Quick Reference](./ENROLLMENT_QUICK_REFERENCE.md)** - Quick reference for developers
- **[Student Status System](./STUDENT_STATUS_SYSTEM.md)** - Student status management and workflows

### API Documentation

- **[Complete API Documentation](../COMPLETE_API_DOCUMENTATION.md)** - Full API reference
- **[API Documentation](../API-DOCUMENTATION.md)** - Core API guide

### Specialized Guides

- **[Teacher Access Control Implementation](../TEACHER_ACCESS_CONTROL_IMPLEMENTATION.md)** - Teacher permission system
- **[Timetable API](../README_TIMETABLE_API.md)** - Timetable management
- **[Marks Management](../marks-management-README.md)** - Academic marks system

### Workflow Documentation

Located in `/workflows/` folder:
- **[Bursar Workflow](../workflows/bursar.workflow.md)**
- **[Discipline Master Workflow](../workflows/disciplinemaster.workflow.md)**
- **[Principal Workflow](../workflows/principal.workflow.md)**
- **[Teacher Workflow](../workflows/teahcer.workflow.md)**
- **[Parent Workflow](../workflows/parent.workflow.md)**
- And more...

## 🚀 Quick Start

### For Developers

1. Start with the [Enrollment Quick Reference](./ENROLLMENT_QUICK_REFERENCE.md)
2. Review the [Complete API Documentation](../COMPLETE_API_DOCUMENTATION.md)
3. Check role-specific workflows for context

### For System Administrators

1. Read the [Student Status System](./STUDENT_STATUS_SYSTEM.md)
2. Review the [Student Enrollment System](./STUDENT_ENROLLMENT_SYSTEM.md)
3. Check workflow documentation for your role

### For New Team Members

1. **Architecture**: Start with the main [README](../README.md)
2. **Development**: Follow the developer guidelines in API docs
3. **Business Logic**: Review workflow documentation
4. **Testing**: Check the comprehensive test seed documentation

## 🔧 System Overview

The School Management System is built with:

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with role-based access control
- **Architecture**: RESTful API with modular design

### Key Features

- **Multi-role Support**: Super Manager, Principal, Vice Principal, Teachers, Parents, etc.
- **Academic Year Management**: Multi-year data with academic year context
- **Two-Level Enrollment**: Class assignment → Subclass enrollment
- **Fee Management**: Automated fee calculation and payment tracking
- **Attendance System**: Student and teacher attendance management
- **Grade Management**: Marks, sequences, and average calculations
- **Communication**: Messaging system between roles
- **Timetable**: Dynamic schedule management

## 📝 Contributing to Documentation

When adding new features or modifying existing ones:

1. Update relevant documentation files
2. Add new files if creating major features
3. Update this README if adding new documentation
4. Follow the existing documentation style and structure
5. Include code examples and use cases

## 🆘 Support

For questions or issues:

1. Check the relevant documentation first
2. Review error handling sections
3. Check troubleshooting guides
4. Refer to the API documentation for endpoint details

## 📋 Documentation Standards

- **Format**: Markdown (.md) files
- **Structure**: Use consistent heading levels
- **Code Examples**: Include realistic, working examples
- **Error Handling**: Document common errors and solutions
- **Use Cases**: Provide practical scenarios
- **API Reference**: Include request/response examples 