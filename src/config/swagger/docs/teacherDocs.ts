// src/config/swagger/docs/teacherDocs.ts
// Swagger documentation for teacher-specific API endpoints

export const teacherApiDocs = {
  '/teachers/me/subjects': {
    get: {
      tags: ['Teachers'],
      summary: 'Get subjects assigned to authenticated teacher',
      description: 'Returns all subjects that the authenticated teacher is assigned to teach, along with subclass information, student counts, and teaching details.',
      parameters: [
        {
          name: 'academicYearId',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
          description: 'Filter by academic year (defaults to current academic year)'
        }
      ],
      responses: {
        200: {
          description: 'Teacher subjects retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Mathematics' },
                        category: { type: 'string', example: 'SCIENCE' },
                        subClasses: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'integer', example: 1 },
                              name: { type: 'string', example: 'Form 1A' },
                              classId: { type: 'integer', example: 1 },
                              className: { type: 'string', example: 'Form 1' },
                              coefficient: { type: 'integer', example: 4 },
                              periodsPerWeek: { type: 'integer', example: 5 },
                              studentCount: { type: 'integer', example: 30 }
                            }
                          }
                        },
                        totalStudents: { type: 'integer', example: 120 },
                        totalPeriods: { type: 'integer', example: 20 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - User not authenticated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'User not authenticated' }
                }
              }
            }
          }
        },
        403: {
          description: 'Forbidden - User does not have TEACHER role',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Access denied: TEACHER role required' }
                }
              }
            }
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  },

  '/teachers/me/students': {
    get: {
      tags: ['Teachers'],
      summary: 'Get students from teacher\'s assigned subclasses',
      description: 'Returns students from subclasses where the authenticated teacher has at least one subject assignment. Supports pagination and filtering.',
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 1 },
          description: 'Page number for pagination'
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 100 },
          description: 'Number of items per page'
        },
        {
          name: 'subClassId',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
          description: 'Filter by specific subclass'
        },
        {
          name: 'subjectId',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
          description: 'Filter by specific subject'
        },
        {
          name: 'academicYearId',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
          description: 'Filter by academic year'
        }
      ],
      responses: {
        200: {
          description: 'Teacher students retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 123 },
                        name: { type: 'string', example: 'John Doe' },
                        matricule: { type: 'string', example: 'STU2024001' },
                        subClass: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer', example: 1 },
                            name: { type: 'string', example: 'Form 1A' },
                            class: {
                              type: 'object',
                              properties: {
                                id: { type: 'integer', example: 1 },
                                name: { type: 'string', example: 'Form 1' }
                              }
                            }
                          }
                        },
                        teacherSubjects: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              subjectId: { type: 'integer', example: 1 },
                              subjectName: { type: 'string', example: 'Mathematics' },
                              coefficient: { type: 'integer', example: 4 }
                            }
                          }
                        }
                      }
                    }
                  },
                  meta: {
                    type: 'object',
                    properties: {
                      totalCount: { type: 'integer', example: 150 },
                      page: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 20 },
                      totalPages: { type: 'integer', example: 8 }
                    }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      },
      security: [{ bearerAuth: [] }]
    }
  },

  '/teachers/me/subclasses': {
    get: {
      tags: ['Teachers'],
      summary: 'Get subclasses where teacher has assignments',
      description: 'Returns all subclasses where the authenticated teacher has at least one subject assignment.',
      parameters: [
        {
          name: 'academicYearId',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
          description: 'Filter by academic year (defaults to current academic year)'
        }
      ],
      responses: {
        200: {
          description: 'Teacher subclasses retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Form 1A' },
                        class: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer', example: 1 },
                            name: { type: 'string', example: 'Form 1' }
                          }
                        },
                        subjects: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'integer', example: 1 },
                              name: { type: 'string', example: 'Mathematics' },
                              coefficient: { type: 'integer', example: 4 },
                              periodsPerWeek: { type: 'integer', example: 5 }
                            }
                          }
                        },
                        studentCount: { type: 'integer', example: 30 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      },
      security: [{ bearerAuth: [] }]
    }
  },

  '/teachers/me/dashboard': {
    get: {
      tags: ['Teachers'],
      summary: 'Get teacher dashboard summary',
      description: 'Returns comprehensive dashboard data for the authenticated teacher including teaching statistics and upcoming tasks.',
      parameters: [
        {
          name: 'academicYearId',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
          description: 'Filter by academic year (defaults to current academic year)'
        }
      ],
      responses: {
        200: {
          description: 'Teacher dashboard data retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      subjectsTaught: { type: 'integer', example: 3 },
                      totalStudents: { type: 'integer', example: 120 },
                      marksToEnter: { type: 'integer', example: 25 },
                      classesToday: { type: 'integer', example: 6 },
                      upcomingPeriods: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            subject: { type: 'string', example: 'Mathematics' },
                            subClass: { type: 'string', example: 'Form 1A' },
                            period: { type: 'string', example: 'Period 3' },
                            time: { type: 'string', example: '10:30 - 11:15' }
                          }
                        }
                      },
                      recentActivity: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            action: { type: 'string', example: 'Marks entered' },
                            subject: { type: 'string', example: 'Mathematics' },
                            subClass: { type: 'string', example: 'Form 1A' },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      },
      security: [{ bearerAuth: [] }]
    }
  },

  '/teachers/me/access-check': {
    get: {
      tags: ['Teachers'],
      summary: 'Check teacher access to specific subject/subclass',
      description: 'Validates whether the authenticated teacher has access to teach a specific subject in a specific subclass.',
      parameters: [
        {
          name: 'subjectId',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
          description: 'Subject ID to check access for'
        },
        {
          name: 'subClassId',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
          description: 'SubClass ID to check access for'
        },
        {
          name: 'academicYearId',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
          description: 'Academic year ID (defaults to current year)'
        }
      ],
      responses: {
        200: {
          description: 'Access check completed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      hasAccess: { type: 'boolean', example: true },
                      subjectId: { type: 'integer', example: 1 },
                      subClassId: { type: 'integer', example: 1 },
                      academicYearId: { type: 'integer', example: 1 }
                    }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      },
      security: [{ bearerAuth: [] }]
    }
  },

  '/teachers/me/subject-ids': {
    get: {
      tags: ['Teachers'],
      summary: 'Get list of subject IDs teacher has access to',
      description: 'Returns an array of subject IDs that the authenticated teacher is assigned to teach.',
      parameters: [
        {
          name: 'academicYearId',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
          description: 'Filter by academic year (defaults to current academic year)'
        }
      ],
      responses: {
        200: {
          description: 'Subject IDs retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [1, 3, 5, 7]
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      },
      security: [{ bearerAuth: [] }]
    }
  },

  '/teachers/me/subclass-ids': {
    get: {
      tags: ['Teachers'],
      summary: 'Get list of subclass IDs teacher has access to',
      description: 'Returns an array of subclass IDs where the authenticated teacher has at least one subject assignment.',
      parameters: [
        {
          name: 'academicYearId',
          in: 'query',
          required: false,
          schema: { type: 'integer' },
          description: 'Filter by academic year (defaults to current academic year)'
        }
      ],
      responses: {
        200: {
          description: 'SubClass IDs retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [1, 2, 3, 5, 8]
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      },
      security: [{ bearerAuth: [] }]
    }
  }
};

export const teacherComponents = {
  schemas: {
    TeacherSubject: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        name: { type: 'string', example: 'Mathematics' },
        category: { type: 'string', enum: ['SCIENCE', 'ARTS', 'PRACTICAL'], example: 'SCIENCE' },
        subClasses: {
          type: 'array',
          items: { $ref: '#/components/schemas/TeacherSubClass' }
        },
        totalStudents: { type: 'integer', example: 120 },
        totalPeriods: { type: 'integer', example: 20 }
      }
    },
    TeacherSubClass: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        name: { type: 'string', example: 'Form 1A' },
        classId: { type: 'integer', example: 1 },
        className: { type: 'string', example: 'Form 1' },
        coefficient: { type: 'integer', example: 4 },
        periodsPerWeek: { type: 'integer', example: 5 },
        studentCount: { type: 'integer', example: 30 }
      }
    },
    TeacherStudent: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 123 },
        name: { type: 'string', example: 'John Doe' },
        matricule: { type: 'string', example: 'STU2024001' },
        subClass: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Form 1A' },
            class: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Form 1' }
              }
            }
          }
        },
        teacherSubjects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              subjectId: { type: 'integer', example: 1 },
              subjectName: { type: 'string', example: 'Mathematics' },
              coefficient: { type: 'integer', example: 4 }
            }
          }
        }
      }
    },
    TeacherDashboard: {
      type: 'object',
      properties: {
        subjectsTaught: { type: 'integer', example: 3 },
        totalStudents: { type: 'integer', example: 120 },
        marksToEnter: { type: 'integer', example: 25 },
        classesToday: { type: 'integer', example: 6 },
        upcomingPeriods: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              subject: { type: 'string', example: 'Mathematics' },
              subClass: { type: 'string', example: 'Form 1A' },
              period: { type: 'string', example: 'Period 3' },
              time: { type: 'string', example: '10:30 - 11:15' }
            }
          }
        },
        recentActivity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: { type: 'string', example: 'Marks entered' },
              subject: { type: 'string', example: 'Mathematics' },
              subClass: { type: 'string', example: 'Form 1A' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }
}; 