# Hevy API MCP Server Implementation Plan

## Project Overview

This project aims to create a Model Context Protocol (MCP) server that interfaces with the Hevy fitness tracking API. The MCP server will allow AI assistants to access workout data, manage routines, and perform other fitness tracking operations through the Hevy API.

## Current Status

The project has:
- Basic MCP server setup with one tool (`get-workouts`)
- Generated API client from OpenAPI specification
- Environment variable configuration for API key

## Implementation Plan

### 1. Project Structure

```
hevy-mcp/
├── .env                   # Environment variables (API keys)
├── src/
│   ├── index.ts           # Main entry point
│   ├── tools/             # Directory for MCP tool implementations
│   │   ├── workouts.ts    # Workout-related tools
│   │   ├── routines.ts    # Routine-related tools
│   │   ├── templates.ts   # Exercise template tools
│   │   └── folders.ts     # Routine folder tools
│   ├── client/            # API client (generated code)
│   └── utils/             # Helper utilities
│       ├── formatters.ts  # Data formatting helpers
│       └── validators.ts  # Input validation helpers
├── scripts/               # Build and utility scripts
└── tests/                 # Test suite
```

### 2. API Endpoints to Implement

Based on the OpenAPI spec, we'll implement tools for the following endpoints:

#### Workouts
- Get workouts (already implemented)
- Create workout
- Update workout
- Get single workout by ID
- Get workout count
- Get workout events (updates/deletes)

#### Routines
- Get routines
- Create routine
- Update routine

#### Exercise Templates
- Get exercise templates
- Get single exercise template by ID

#### Routine Folders
- Get routine folders
- Create routine folder
- Get routine folder by ID

### 3. MCP Tool Implementations

#### 3.1 Workout Tools
- `get-workouts`: Fetches and formats workout data (already implemented)
- `get-workout`: Gets a single workout by ID
- `create-workout`: Creates a new workout
- `update-workout`: Updates an existing workout
- `get-workout-count`: Gets the total count of workouts
- `get-workout-events`: Gets workout update/delete events since a given date

#### 3.2 Routine Tools
- `get-routines`: Fetches and formats routine data
- `create-routine`: Creates a new routine
- `update-routine`: Updates an existing routine
- `get-routine`: Gets a single routine by ID

#### 3.3 Exercise Template Tools
- `get-exercise-templates`: Fetches exercise templates
- `get-exercise-template`: Gets a template by ID

#### 3.4 Routine Folder Tools
- `get-routine-folders`: Fetches routine folders
- `create-routine-folder`: Creates a new folder
- `get-routine-folder`: Gets a folder by ID

### 4. Implementation Steps

1. **Refactor Current Code**
   - Move the existing `get-workouts` implementation to a dedicated file in the tools directory
   - Create a modular structure for adding new tools

2. **Implement Data Type Definitions**
   - Create Zod schemas for all request and response objects
   - Ensure proper validation of inputs

3. **Implement Tools by Category**
   - Start with workout tools (highest priority)
   - Then implement routine tools
   - Follow with exercise template tools
   - Finally implement routine folder tools

4. **Add Error Handling and Retries**
   - Implement proper error handling and user-friendly error messages
   - Add retries for transient failures
   - Rate limiting support

5. **Add Testing**
   - Write unit tests for each tool
   - Create mock API responses for testing
   - Add integration tests

6. **Documentation**
   - Document each tool with examples
   - Create usage guides
   - Document error scenarios and handling

### 5. Formatting and Presentation

For each tool, we'll implement consistent formatting to ensure AI assistants can present the data effectively:

- Workouts: Format with date, name, exercises, sets, weights, etc.
- Routines: Format with title, exercises, target sets/reps
- Exercise Templates: Format with name, muscle groups, instructions
- Folders: Format with title and contained routines

### 6. Development Phases

#### Phase 1: Core Functionality
- Refactor existing code
- Implement basic workout tools (get, create, update)
- Add proper error handling

#### Phase 2: Expanded Features
- Implement routine tools
- Implement exercise template tools
- Add pagination support

#### Phase 3: Advanced Features
- Implement routine folder tools
- Add advanced filtering options
- Implement workout events endpoint

#### Phase 4: Polish and Performance
- Optimize API calls
- Add caching where appropriate
- Improve error handling and user messaging

### 7. Future Enhancements

- Add analytics capabilities (workout trends, progress tracking)
- Implement workout recommendation features
- Add support for searching and filtering workouts
- Create visualization helpers for workout data

## Conclusion

This implementation plan provides a structured approach to building a comprehensive MCP server for the Hevy API. By following this plan, we can create a robust interface that allows AI assistants to effectively interact with workout and fitness data through the MCP protocol.