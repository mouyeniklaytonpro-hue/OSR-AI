This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Business Brain and OpenAI

The Workspace sends requests to a server-side Next.js route, which uses
`OPENAI_API_KEY` to select the relevant OSR-AI agents and generate a response.
The key is only read on the server; do not rename it to a `NEXT_PUBLIC_` variable
or include it in client-side code.

The system keeps universal operating guidance separate from company profiles.
The active pilot profile is OSR Conseil. Its confirmed business context includes
the four pillars Communication & Social Media, Création digitale & Web,
Formation, and Production visuelle; a hybrid model combining in-house delivery
with specialist subcontracting; and coordination of web projects by OSR
Conseil. The profile separates confirmed information, hypotheses, and missing
information. No hypotheses are currently documented. Unknown service details,
customer sectors, pricing, capacity, objectives, results, and other missing
facts must not be invented.

Known facts about OSR Auto and OSR by Saint remain in separate inactive
profiles; only the explicitly supplied active profile is formatted and sent to
the router, selected agents, and coordinator. The company profile schema can
also represent client-specific confirmed information, hypotheses, and missing
information without adding OSR Conseil facts to the universal context. The
five agents retain their individual expertise and receive the same active
company context. API usage varies with the number of selected agents.

The active company is currently fixed to the OSR Conseil pilot on the server.
Authentication, per-user company selection, and secure tenant-scoped storage are
not implemented. Supplying a client profile in code does not establish access
control or secure tenant isolation. Before using client profiles with
confidential data, implement authenticated company selection and tenant-scoped
storage and verify isolation end to end.

Set `OPENAI_API_KEY` in the server environment (or in the ignored `app/.env.local`
file) before starting the application. Restart the development server after
changing the environment.

To verify a real response from OpenAI, set `OPENAI_API_KEY` in the shell and run:

```bash
npm run test:openai
```

The integration test is skipped when `OPENAI_API_KEY` is not set. It makes real
OpenAI API calls when enabled and may incur API usage charges.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
