# Contributing to EcoFootprint

We are excited that you want to contribute to the Carbon Footprint Awareness Platform! To maintain codebase quality and security, please follow these simple steps.

## Code Quality Standards

* **TypeScript Strictness**: Always use explicit type annotations. Avoid the `any` keyword.
* **Component Accessibility**: Ensure every interactive component, form input, button, and chart has appropriate ARIA labels and keyboard navigation support.
* **Architecture Integrity**: Keep features isolated. Business logic must go in `services/` or `providers/`, persistent logic in `repositories/`, and widgets in `widgets/`.
* **Clean Code**: Follow SOLID principles. Use descriptive, self-documenting naming conventions.

## Development Workflow

1. Fork the repository and create your feature branch: `git checkout -b feature/cool-new-feature`.
2. Install dependencies: `npm install --legacy-peer-deps`.
3. Verify typechecking and building: `npm run build`.
4. Run all unit and component tests: `npm run test` or `npx vitest run`.
5. Ensure code coverage is at or above **80%** before submitting a Pull Request.
6. Submit your PR and reference the matching issue template.
