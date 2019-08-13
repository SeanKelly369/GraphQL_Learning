import {
    GraphQLServer
} from 'graphql-yoga';
import uuidv4 from 'uuid/v4'

// Scaler types: String, Boolean, Int, Float, ID


// Demo user data
const users = [{
    id: '1',
    name: 'Andrew',
    email: 'andrew@example.com',
    age: 27
}, {
    id: '2',
    name: 'Sarah',
    email: 'sarah@example.com'
}, {
    id: '3',
    name: 'Mike',
    email: 'mike@example.com'
}]

const posts = [{
    id: '10',
    title: 'Dangerous',
    body: 'You playing with a smooth criminal..',
    published: true,
    author: '1'
}, {
    id: '11',
    title: 'Leave me alone',
    body: 'Just stop dogging me around..',
    published: false,
    author: '3'
}, {
    id: '12',
    title: 'Black or white',
    body: `It don't matter if you're black or white..`,
    published: true,
    author: '2'
}]


// Comments array
const comments = [{
    id: '101',
    text: `How's are you today?`,
    author: '3',
    post: '10'
}, {
    id: '102',
    text: `I'm fine, thank you.  How are you?`,
    author: '1',
    post: '10'
}, {
    id: '103',
    text: `Not bad at all, yourself?`,
    author: '2', // associations
    post: '11'
}, {
    id: '104',
    text: `Good, good.  Lovely weather, isn't it`,
    author: '1',
    post: '11'
}]


// Type definitions ( schema )
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments: [Comment!]!
        me: User!
        post: Post!
    }

    type Mutation {
        createUser(date: CreateUserInput): User!
        createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
        createComment(text: String!, author: ID!, post: ID!): Comment!
    }

    
    input CreateUserInput {
        name: String!
        email: String!
        age: Int
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post
    }

`

// Resolvers
const resolvers = {
    Query: {
        users(parent, args, ctx, info) {
            if (!args.query) {
                return users
            }
            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        posts(parent, args, ctx, info) {
            if (!args.query) {
                return posts
            }
            return posts.filter((post) => {
                const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase())
                const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase())
                return (isTitleMatch || isBodyMatch)
            })
        },
        comments(parent, args, ctx, info) {
            return comments
        },
        me() {
            return {
                id: '123098',
                name: 'Derek',
                email: 'derek@gmail.com'
            }
        },
        post() {
            return {
                id: '45678124',
                title: `Gulliver's Travels`,
                body: 'Once upon a time....',
                published: true
            }
        },
    },
    Mutation: {
        createUser(parent, args, ctx, info) {
            const emailTaken = users.some((user) => user.email === args.data.email)

            if (emailTaken) {
                throw new Error('Email taken')
            }

            const user = {
                id: uuidv4(),
                ...args.data
            }

            users.push(user)

            return user
        },
        createPost(parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.author)

            if (!userExists) {
                throw new Error('User not found')
            }

            const post = {
                id: uuidv4(),
                ...args
            }

            posts.push(post)

            return post
        },
        createComment(pareng, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.author)
            const postsExists = posts.some((post) => post.id === args.post && post.published)

            if (!userExists || !postsExists) {
                throw new Error('Unable to find user and post')
            }

            const comment = {
                id: uuidv4(),
                ...args
            }

            comments.push(comment)

            return comment
        }
    },
    Post: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.post === parent.id
            })
        }
    },
    Comment: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        post(parent, args, ctx, info) {
            return posts.find((post) => {
                return post.id === parent.post
            })
        }
    },
    User: {
        posts(parent, args, ctx, info) {
            return posts.filter((post) => {
                return post.author === parent.id
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.author === parent.id
            })
        }
    }


};

const server = new GraphQLServer({
    typeDefs,
    resolvers
});

server.start(() => {
    console.log('The server is up!');
});