import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '@/plugin-backend/prisma-find-naming-convention';

describe('prisma-find-naming-convention', () => {
  const ruleTester = new RuleTester();

  RuleTester.afterAll = () => {
    // No-op for Vitest
  };

  ruleTester.run('prisma-find-naming-convention', rule, {
    valid: [
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
      {
        code: `
        async function findUser() {
          return await someOtherService.findUnique({
            where: { id: 1 }
          });
        }
      `,
      },
      {
        code: `
        const user = await prisma.user.findUnique({
          where: { id: 1 }
        });
      `,
      },
      {
        code: `
        async function findManyActiveUsers() {
          return await prisma.user.findMany();
        }
      `,
      },
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
});
