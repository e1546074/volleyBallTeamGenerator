# Volleyball Team Generator

A team generation algorithm for volleyball with position-specific scoring based on player attributes.

## Features

- Position-specific weightings for 10 player attributes
- Team generation algorithm that balances player skills across teams
- Support for multiple team sizes (5, 6, 7 players per team)
- Comprehensive test suite with 42+ tests

## Position Weights

Each position has specific weightings for the following attributes:

| Attribute | Setter | Middle Blocker | Outside Hitter |
| --- | --- | --- | --- |
| height | 0.0882 | 0.1308 | 0.1018 |
| verticalJump | 0.0735 | 0.1163 | 0.1163 |
| speedAgility | 0.1177 | 0.1018 | 0.1163 |
| spiking | 0.0588 | 0.0872 | 0.1309 |
| blocking | 0.0882 | 0.1308 | 0.1018 |
| setting | 0.1471 | 0.0581 | 0.0525 |
| passing | 0.1029 | 0.0685 | 0.0918 |
| defense | 0.1029 | 0.1096 | 0.0918 |
| serving | 0.0882 | 0.0872 | 0.0918 |
| gameIQ | 0.1324 | 0.1096 | 0.1050 |

All weights for each position sum to exactly 1.00.

## Installation

```bash
npm install
```

## Usage

### Running Tests

```bash
npm test
```

### Running Linting

```bash
npm run lint
```

### Full Validation

```bash
npm run validate
```

### Watch Mode (Tests)

```bash
npm run test:watch
```

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

### CI Pipeline
- **Triggers**: Push to `main` or `develop`, Pull Requests to `main`
- **Jobs**:
  - `test`: Runs all unit tests
  - `lint`: Checks code style with ESLint
  - `validate`: Runs both tests and linting

### Deployment Pipeline
- **Triggers**: Push to `main`
- **Jobs**:
  - Runs tests and linting
  - Deploys to GitHub Pages (if all checks pass)

## Badges

![CI Pipeline](https://github.com/e1546074/volleyBallTeamGenerator/actions/workflows/ci.yml/badge.svg)
![Deployment Pipeline](https://github.com/e1546074/volleyBallTeamGenerator/actions/workflows/deploy.yml/badge.svg)

## Project Structure

```
volleyBallTeamGenerator/
├── .github/
│   └── workflows/
│       ├── ci.yml          # CI pipeline configuration
│       └── deploy.yml      # Deployment pipeline configuration
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── css/                    # CSS files
├── js/                     # JavaScript source files
│   ├── algorithm.js        # Core algorithm with position weights
│   ├── algorithm.test.js   # Test suite for algorithm
│   ├── app.js              # Application logic
│   ├── data.js             # Data models
│   └── ui.js               # UI components
├── index.html              # Main HTML file
├── package.json            # Node.js dependencies and scripts
├── README.md               # Project documentation
└── test.html               # Test HTML page
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT
