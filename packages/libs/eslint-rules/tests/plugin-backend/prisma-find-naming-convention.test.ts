import rule from '@/plugin-backend/prisma-find-naming-convention';
import { RuleTester } from '@typescript-eslint/rule-tester';

const ruleTester = new RuleTester();

ruleTester.run('prisma-find-naming-convention', rule, {
  valid: [
    // findUnique with Active suffix
    {
      code: `
        async function findUniqueActiveUser() {
          return await prisma.user.findUnique({
            where: {
              id: 1,
              deletedAt: null
            }
          });
        }
      `,
    },
    // findUnique with Deleted suffix
    {
      code: `
        async function findUniqueDeletedUser() {
          return await prisma.user.findUnique({
            where: {
              id: 1,
              deletedAt: { not: null }
            }
          });
        }
      `,
    },
    // findUnique with Any suffix
    {
      code: `
        async function findUniqueAnyUser() {
          return await prisma.user.findUnique({
            where: {
              id: 1,
              OR: [
                { deletedAt: null },
                { deletedAt: { not: null } }
              ]
            }
          });
        }
      `,
    },
    // findUniqueOrThrow with Active suffix
    {
      code: `
        async function findUniqueOrThrowActivePost() {
          return await prisma.post.findUniqueOrThrow({
            where: {
              id: 1,
              deletedAt: null
            }
          });
        }
      `,
    },
    // findFirst with Active suffix
    {
      code: `
        async function findFirstActiveComment() {
          return await prisma.comment.findFirst({
            where: {
              userId: 1,
              deletedAt: null
            }
          });
        }
      `,
    },
    // findFirstOrThrow with Deleted suffix
    {
      code: `
        async function findFirstOrThrowDeletedOrder() {
          return await prisma.order.findFirstOrThrow({
            where: {
              status: 'cancelled',
              deletedAt: { not: null }
            }
          });
        }
      `,
    },
    // findMany with Active suffix
    {
      code: `
        async function findManyActiveUsers() {
          return await prisma.user.findMany({
            where: {
              active: true,
              deletedAt: null
            }
          });
        }
      `,
    },
    // findMany with Deleted suffix
    {
      code: `
        async function findManyDeletedPosts() {
          return await prisma.post.findMany({
            where: {
              published: false,
              deletedAt: { not: null }
            }
          });
        }
      `,
    },
    // findMany with Any suffix
    {
      code: `
        async function findManyAnyComments() {
          return await prisma.comment.findMany({
            where: {
              postId: 1,
              OR: [
                { deletedAt: null },
                { deletedAt: { not: null } }
              ]
            }
          });
        }
      `,
    },
    // Repository pattern with correct naming
    {
      code: `
        class UserRepository {
          async findUniqueActiveUser(id: number) {
            return await this.repository.user.findUnique({
              where: {
                id,
                deletedAt: null
              }
            });
          }
        }
      `,
    },
    // Arrow function with correct name
    {
      code: `
        const findFirstActiveProduct = async (name: string) => {
          return await prisma.product.findFirst({
            where: {
              name,
              deletedAt: null
            }
          });
        };
      `,
    },
    // Method in object literal
    {
      code: `
        const userService = {
          async findManyActiveUsers() {
            return await prisma.user.findMany({
              where: {
                role: 'USER',
                deletedAt: null
              }
            });
          }
        };
      `,
    },
    // Case insensitive matching
    {
      code: `
        async function FindUniqueActiveUser() {
          return await prisma.user.findUnique({
            where: {
              id: 1,
              deletedAt: null
            }
          });
        }
      `,
    },
    // Different prisma access patterns
    {
      code: `
        async function findFirstActiveUser() {
          return await this.prisma.user.findFirst({
            where: {
              email: 'test@example.com',
              deletedAt: null
            }
          });
        }
      `,
    },
    {
      code: `
        async function findManyDeletedComments() {
          return await repository.comment.findMany({
            where: {
              reported: true,
              deletedAt: { not: null }
            }
          });
        }
      `,
    },
    // findUnique with additional suffix after Active/Deleted/Any
    {
      code: `
        async function findUniqueActiveUserById(id: number) {
          return await prisma.user.findUnique({
            where: {
              id,
              deletedAt: null
            }
          });
        }
      `,
    },
    {
      code: `
        async function findManyDeletedPostsByAuthor(authorId: number) {
          return await prisma.post.findMany({
            where: {
              authorId,
              deletedAt: { not: null }
            }
          });
        }
      `,
    },
    // Not a Prisma find call
    {
      code: `
        async function findUser() {
          return await someOtherService.findUnique({
            where: { id: 1 }
          });
        }
      `,
    },
    // Find call outside of function
    {
      code: `
        const user = await prisma.user.findUnique({
          where: { id: 1 }
        });
      `,
    },
    // Empty where clause for non-Any types (no deletedAt required)
    {
      code: `
        async function findManyActiveUsers() {
          return await prisma.user.findMany();
        }
      `,
    },
    // Without where clause for non-Any types
    {
      code: `
        async function findFirstActivePost() {
          return await prisma.post.findFirst({
            select: { id: true, title: true }
          });
        }
      `,
    },
  ],
  invalid: [
    // findUnique without Active/Deleted/Any suffix
    {
      code: `
        async function findUniqueUser() {
          return await prisma.user.findUnique({
            where: { id: 1 }
          });
        }
      `,
      errors: [
        {
          messageId: 'invalidFindMethodName',
          data: {
            method: 'findUnique',
            functionName: 'findUniqueUser',
          },
        },
      ],
    },
    // findUniqueOrThrow with wrong prefix
    {
      code: `
        async function getUserOrThrow() {
          return await prisma.user.findUniqueOrThrow({
            where: { id: 1 }
          });
        }
      `,
      errors: [
        {
          messageId: 'invalidFindMethodName',
          data: {
            method: 'findUniqueOrThrow',
            functionName: 'getUserOrThrow',
          },
        },
      ],
    },
    // findFirst with wrong name
    {
      code: `
        async function getFirstComment() {
          return await prisma.comment.findFirst({
            where: { postId: 1 }
          });
        }
      `,
      errors: [
        {
          messageId: 'invalidFindMethodName',
          data: {
            method: 'findFirst',
            functionName: 'getFirstComment',
          },
        },
      ],
    },
    // findMany with wrong name
    {
      code: `
        async function getAllUsers() {
          return await prisma.user.findMany({
            where: { active: true }
          });
        }
      `,
      errors: [
        {
          messageId: 'invalidFindMethodName',
          data: {
            method: 'findMany',
            functionName: 'getAllUsers',
          },
        },
      ],
    },
    // Active function missing deletedAt filter
    {
      code: `
        async function findUniqueActiveUser() {
          return await prisma.user.findUnique({
            where: { id: 1 }
          });
        }
      `,
      errors: [
        {
          messageId: 'missingDeletedAtFilter',
          data: {
            functionName: 'findUniqueActiveUser',
          },
        },
      ],
    },
    // Deleted function missing deletedAt filter
    {
      code: `
        async function findManyDeletedPosts() {
          return await prisma.post.findMany({
            where: { published: false }
          });
        }
      `,
      errors: [
        {
          messageId: 'missingDeletedAtFilter',
          data: {
            functionName: 'findManyDeletedPosts',
          },
        },
      ],
    },
    // Active function with wrong deletedAt value
    {
      code: `
        async function findFirstActiveComment() {
          return await prisma.comment.findFirst({
            where: {
              postId: 1,
              deletedAt: { not: null }
            }
          });
        }
      `,
      errors: [
        {
          messageId: 'incorrectDeletedAtValue',
          data: {
            functionName: 'findFirstActiveComment',
            expected: 'null',
            actual: 'not null',
          },
        },
      ],
    },
    // Deleted function with wrong deletedAt value
    {
      code: `
        async function findManyDeletedOrders() {
          return await prisma.order.findMany({
            where: {
              status: 'cancelled',
              deletedAt: null
            }
          });
        }
      `,
      errors: [
        {
          messageId: 'incorrectDeletedAtValue',
          data: {
            functionName: 'findManyDeletedOrders',
            expected: '{ not: null }',
            actual: 'null',
          },
        },
      ],
    },
    // Any function missing OR clause
    {
      code: `
        async function findUniqueAnyUser() {
          return await prisma.user.findUnique({
            where: { id: 1 }
          });
        }
      `,
      errors: [
        {
          messageId: 'missingAnyIndicator',
          data: {
            functionName: 'findUniqueAnyUser',
          },
        },
      ],
    },
    // Any function without where clause
    {
      code: `
        async function findManyAnyComments() {
          return await prisma.comment.findMany();
        }
      `,
      errors: [
        {
          messageId: 'missingAnyIndicator',
          data: {
            functionName: 'findManyAnyComments',
          },
        },
      ],
    },
    // deletedAt not last in where clause
    {
      code: `
        async function findUniqueActiveUser() {
          return await prisma.user.findUnique({
            where: {
              deletedAt: null,
              id: 1
            }
          });
        }
      `,
      errors: [
        {
          messageId: 'deletedAtNotLastInWhere',
        },
      ],
    },
    // OR not last in where clause for Any
    {
      code: `
        async function findManyAnyPosts() {
          return await prisma.post.findMany({
            where: {
              OR: [
                { deletedAt: null },
                { deletedAt: { not: null } }
              ],
              published: true
            }
          });
        }
      `,
      errors: [
        {
          messageId: 'deletedAtNotLastInWhere',
        },
      ],
    },
    // Class method with wrong name
    {
      code: `
        class UserService {
          async getUser(id: number) {
            return await this.prisma.user.findUnique({
              where: { id }
            });
          }
        }
      `,
      errors: [
        {
          messageId: 'invalidFindMethodName',
          data: {
            method: 'findUnique',
            functionName: 'getUser',
          },
        },
      ],
    },
    // Arrow function with wrong name
    {
      code: `
        const fetchPost = async (id: number) => {
          return await prisma.post.findFirst({
            where: { id }
          });
        };
      `,
      errors: [
        {
          messageId: 'invalidFindMethodName',
          data: {
            method: 'findFirst',
            functionName: 'fetchPost',
          },
        },
      ],
    },
    // Repository pattern with wrong method name
    {
      code: `
        class UserRepository {
          async retrieveUsers() {
            return await this.repository.user.findMany({
              where: { active: true }
            });
          }
        }
      `,
      errors: [
        {
          messageId: 'invalidFindMethodName',
          data: {
            method: 'findMany',
            functionName: 'retrieveUsers',
          },
        },
      ],
    },
    // Multiple errors in the same code
    {
      code: `
        async function getUser() {
          return await prisma.user.findUnique({
            where: { id: 1 }
          });
        }

        async function findManyActivePosts() {
          return await prisma.post.findMany({
            where: { published: true }
          });
        }

        async function findFirstDeletedComment() {
          return await prisma.comment.findFirst({
            where: {
              reported: true,
              deletedAt: null
            }
          });
        }
      `,
      errors: [
        {
          messageId: 'invalidFindMethodName',
          data: {
            method: 'findUnique',
            functionName: 'getUser',
          },
        },
        {
          messageId: 'missingDeletedAtFilter',
          data: {
            functionName: 'findManyActivePosts',
          },
        },
        {
          messageId: 'incorrectDeletedAtValue',
          data: {
            functionName: 'findFirstDeletedComment',
            expected: '{ not: null }',
            actual: 'null',
          },
        },
      ],
    },
    // Deleted function with incorrect deletedAt structure
    {
      code: `
        async function findUniqueDeletedUser() {
          return await prisma.user.findUnique({
            where: {
              id: 1,
              deletedAt: { notEqual: null }
            }
          });
        }
      `,
      errors: [
        {
          messageId: 'incorrectDeletedAtValue',
          data: {
            functionName: 'findUniqueDeletedUser',
            expected: '{ not: null }',
            actual: 'incorrect structure',
          },
        },
      ],
    },
  ],
});
