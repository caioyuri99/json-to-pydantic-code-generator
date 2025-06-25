# JSON to Pydantic Code Generator

Generate Pydantic models automatically from JSON data.

## Features

- Converts JSON objects to Pydantic model classes
- Handles nested objects and arrays
- Supports Python type annotations
- Customizable output via flags
- Supports aliasing for camelCase fields
- Option to reuse class definitions
- Configurable indentation
- Option to make fields optional
- Supports avoiding reserving Python keywords as field names

## Installation

```bash
npm install json-to-pydantic-code-generator
```

## Usage

```typescript
import { generatePydanticCode } from "json-to-pydantic-code-generator";

// Also available: error classes for better error handling
import { 
  InvalidIndentationError, 
  InvalidJSONString, 
  MalformedJSONError 
} from "json-to-pydantic-code-generator";

const json = {
  "user": {
    "id": 123,
    "name": "Alice",
    "isActive": true,
    "roles": [
      { "roleId": 1, "roleName": "admin" },
      { "roleId": 2, "roleName": "user" }
    ],
    "profile": {
      "email": "alice@example.com",
      "address": {
        "city": "Wonderland",
        "zip": "00000"
      }
    }
  },
  "createdAt": "2025-06-20T12:00:00Z"
};

// Accepts JSON objects, arrays, or JSON strings
const code = generatePydanticCode(json, "Root", {
  indentation: 2,
  forceOptional: "OnlyRootClass",
  aliasCamelCase: true
});
console.log(code);
```

## Output Example

```python
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class Role(BaseModel):
  role_id: int = Field(..., alias='roleId')
  role_name: str = Field(..., alias='roleName')


class Address(BaseModel):
  city: str
  zip: str


class Profile(BaseModel):
  email: str
  address: Address


class User(BaseModel):
  id: int
  name: str
  is_active: bool = Field(..., alias='isActive')
  roles: List[Role]
  profile: Profile


class Root(BaseModel):
  user: Optional[User] = None
  created_at: Optional[str] = Field(None, alias='createdAt')
```

## Flags

- `indentation` (number): Number of spaces for indentation (default: 4) (NOTE: this flag has no effect if `useTabs` is set to `true`, in which case it will use a single tab character for indentation. The tab size is determined by the environment or editor settings.)
- `preferClassReuse` (boolean): Reuse identical class definitions (default: false)
- `forceOptional` ("None" | "OnlyRootClass" | "AllClasses"): Make fields optional in the root or all classes (default: "None")
- `aliasCamelCase` (boolean): Use snake_case for field names and set original names as aliases (default: false)
- `useTabs` (boolean): Use tabs instead of spaces for indentation (default: false)

## Error Handling

The package exports custom error classes for better error handling:

```typescript
try {
  const code = generatePydanticCode('invalid json', 'Model');
} catch (error) {
  if (error instanceof InvalidJSONString) {
    console.log('Invalid JSON string provided');
  } else if (error instanceof InvalidIndentationError) {
    console.log('Invalid indentation value');
  }
}
```

## Output Examples for Each Flag

### 1. `indentation`

**Input:**

```typescript
const json = {
    "user": "Mary"
    "id": 123,
}

const code = generatePydanticCode(json, "Root", { indentation: 3 });
console.log(code);
```

**Output:**

```python
from __future__ import annotations

from pydantic import BaseModel


class Root(BaseModel):
   user: str
   id: int
```

### 2. `preferClassReuse`

**Input:**

```typescript
const json = { 
  "user1": { "name": "Alice" },
  "user2": { "name": "Bob" } 
};

const code = generatePydanticCode(json, "Root", { preferClassReuse: true });
console.log(code);
```

**Output:**

```python
from __future__ import annotations

from pydantic import BaseModel


class User1(BaseModel):
    name: str


class Root(BaseModel):
    user1: User1
    user2: User1

```

### 3. `forceOptional`

**Input:**

```typescript
const json = {
  "name": "Alice",
  "address": {
    "street": "Main St",
    "zip": "12345"
  }
}

const code = generatePydanticCode(json, "Root", {
  forceOptional: "OnlyRootClass"
});
console.log(code);
```

**Output:**

```python
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class Address(BaseModel):
    street: str
    zip: str

class Root(BaseModel):
    name: Optional[str] = None
    address: Optional[Address] = None
```

**Input:**

```typescript
const json = {
  "name": "Alice",
  "address": {
    "street": "Main St",
    "zip": "12345"
  }
}

const code = generatePydanticCode(json, "Root", {
  forceOptional: "AllClasses"
});
console.log(code);
```

**Output:**

```python
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class Address(BaseModel):
    street: Optional[str] = None
    zip: Optional[str] = None

class Root(BaseModel):
    name: Optional[str] = None
    address: Optional[Address] = None
```

### 4. `aliasCamelCase`

**Input:**

```typescript
const json = {
  userName: "Alice",
  emailAddress: "alice@example.com"
    
}

const code = generatePydanticCode(json, "Root", { aliasCamelCase: true });
console.log(code);
```

**Output:**

```python
from __future__ import annotations

from pydantic import BaseModel, Field


class User(BaseModel):
    user_name: str = Field(..., alias='userName')
    email_address: str = Field(..., alias='emailAddress')
```

## License

MIT
