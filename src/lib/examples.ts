export const EXAMPLES: Record<string, { label: string; code: string }> = {
  flowchart: {
    label: 'Flowchart',
    code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`,
  },
  sequence: {
    label: 'Sequence Diagram',
    code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John
    John-->>Alice: Hi Alice
    Alice->>Bob: How are you?
    Bob-->>Alice: Great!`,
  },
  class: {
    label: 'Class Diagram',
    code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Duck : +String beakColor
    Duck : +swim()
    Fish : +int sizeInFeet
    Fish : +canEat()`,
  },
  er: {
    label: 'ER Diagram',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int orderNumber
        string deliveryAddress
    }`,
  },
  gantt: {
    label: 'Gantt Chart',
    code: `gantt
    title Project Schedule
    dateFormat YYYY-MM-DD
    section Design
        Wireframes     :a1, 2024-01-01, 7d
        Mockups        :a2, after a1, 5d
    section Development
        Frontend       :b1, after a2, 14d
        Backend        :b2, after a2, 14d
    section Testing
        QA Testing     :c1, after b1, 7d`,
  },
  pie: {
    label: 'Pie Chart',
    code: `pie title Favorite Pets
    "Dogs" : 45
    "Cats" : 30
    "Birds" : 15
    "Fish" : 10`,
  },
  state: {
    label: 'State Diagram',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : Submit
    Processing --> Success : Done
    Processing --> Error : Fail
    Error --> Idle : Retry
    Success --> [*]`,
  },
  journey: {
    label: 'User Journey',
    code: `journey
    title My Working Day
    section Go to work
        Make tea: 5: Me
        Go upstairs: 3: Me
        Do work: 1: Me, Cat
    section Go home
        Go downstairs: 5: Me
        Sit down: 5: Me`,
  },
  mindmap: {
    label: 'Mindmap',
    code: `mindmap
  root((Project))
    Design
      UI/UX
      Branding
    Development
      Frontend
      Backend
      Database
    Testing
      Unit Tests
      Integration`,
  },
  gitgraph: {
    label: 'Git Graph',
    code: `gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit`,
  },
  c4context: {
    label: 'C4 Context',
    code: `C4Context
    title System Context Diagram
    Person(customer, "Customer", "A user of the system")
    System(webApp, "Web Application", "Delivers content")
    System_Ext(email, "Email System", "Sends emails")
    Rel(customer, webApp, "Uses")
    Rel(webApp, email, "Sends emails using")`,
  },
  timeline: {
    label: 'Timeline',
    code: `timeline
    title Product Launch Timeline
    2024-Q1 : Research
            : User interviews
    2024-Q2 : Design
            : Prototyping
    2024-Q3 : Development
            : Alpha release
    2024-Q4 : Launch
            : Marketing push`,
  },
  sankey: {
    label: 'Sankey',
    code: `sankey-beta
    Source A,Target X,30
    Source A,Target Y,20
    Source B,Target X,15
    Source B,Target Z,25
    Target X,Final,45
    Target Y,Final,20
    Target Z,Final,25`,
  },
  xy: {
    label: 'XY Chart',
    code: `xychart-beta
    title "Monthly Sales"
    x-axis [Jan, Feb, Mar, Apr, May, Jun]
    y-axis "Revenue (k)" 0 --> 100
    bar [30, 45, 60, 55, 70, 85]
    line [25, 40, 55, 50, 65, 80]`,
  },
  block: {
    label: 'Block Diagram',
    code: `block-beta
    columns 3
    a["Frontend"] b["API Gateway"] c["Backend"]
    d["React App"]:1 e["REST API"]:1 f["Node.js"]:1
    g["CDN"]:1 h["Load Balancer"]:1 i["Database"]:1`,
  },
  quadrant: {
    label: 'Quadrant Chart',
    code: `quadrantChart
    title Feature Priority Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Plan
    quadrant-2 Do First
    quadrant-3 Delegate
    quadrant-4 Eliminate
    Feature A: [0.3, 0.8]
    Feature B: [0.7, 0.9]
    Feature C: [0.2, 0.3]
    Feature D: [0.8, 0.2]
    Feature E: [0.5, 0.6]`,
  },
  requirement: {
    label: 'Requirement',
    code: `requirementDiagram

requirement user_auth {
id: 1
text: Users must authenticate.
risk: high
verifymethod: test
}

requirement session_mgmt {
id: 2
text: Sessions expire after 30 minutes.
risk: medium
verifymethod: inspection
}

element web_app {
type: simulation
}

web_app - satisfies -> user_auth
web_app - satisfies -> session_mgmt`,
  },
  kanban: {
    label: 'Kanban Board',
    code: `kanban
    Todo
        Design homepage
        Write API docs
    In Progress
        Build auth module
        Setup CI/CD
    Done
        Project setup
        Database schema`,
  },
  packet: {
    label: 'Packet Diagram',
    code: `packet-beta
    0-15: "Source Port"
    16-31: "Destination Port"
    32-63: "Sequence Number"
    64-95: "Acknowledgment Number"
    96-99: "Data Offset"
    100-105: "Reserved"
    106-111: "Flags"
    112-127: "Window Size"`,
  },
  architecture: {
    label: 'Architecture',
    code: `architecture-beta
    group cloud(cloud)[Cloud]
    service api(server)[API] in cloud
    service db(database)[DB] in cloud
    service web(internet)[Web] in cloud

    web:R --> L:api
    api:R --> L:db`,
  },
  network: {
    label: 'Network Diagram',
    code: `graph TB
    subgraph Internet
        USER[Users / Clients]
    end
    subgraph DMZ
        FW1[Firewall]
        LB[Load Balancer]
    end
    subgraph Internal Network
        subgraph Web Tier
            WEB1[Web Server 1]
            WEB2[Web Server 2]
        end
        subgraph App Tier
            APP1[App Server 1]
            APP2[App Server 2]
        end
        subgraph Data Tier
            DB1[(Primary DB)]
            DB2[(Replica DB)]
        end
    end
    USER -->|HTTPS| FW1
    FW1 --> LB
    LB --> WEB1
    LB --> WEB2
    WEB1 --> APP1
    WEB2 --> APP2
    APP1 --> DB1
    APP2 --> DB1
    DB1 -.->|Replication| DB2`,
  },
  flowchartLR: {
    label: 'Flowchart (LR)',
    code: `graph LR
    A[Input] --> B[Process]
    B --> C{Valid?}
    C -->|Yes| D[Save]
    C -->|No| E[Error]
    D --> F[Output]
    E --> B
    style A fill:#d4edda
    style F fill:#d4edda
    style E fill:#f8d7da`,
  },
  classfull: {
    label: 'Class (Full)',
    code: `classDiagram
    class Vehicle {
        +String make
        +String model
        +int year
        +start() void
        +stop() void
    }
    class Car {
        +int doors
        +openTrunk() void
    }
    class Truck {
        +float payload
        +loadCargo() void
    }
    class Electric {
        +int batteryCapacity
        +charge() void
    }
    Vehicle <|-- Car
    Vehicle <|-- Truck
    Car <|-- Electric
    Vehicle : +getInfo() String`,
  },
  seqadvanced: {
    label: 'Sequence (Advanced)',
    code: `sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend
    participant API as API Server
    participant DB as Database
    participant Cache as Redis Cache

    User->>+FE: Click Login
    FE->>+API: POST /auth/login
    API->>+Cache: Check session
    Cache-->>-API: Miss
    API->>+DB: Query user
    DB-->>-API: User data
    API->>Cache: Store session
    API-->>-FE: JWT Token
    FE-->>-User: Dashboard

    Note over User,Cache: Subsequent requests use cached session

    User->>+FE: Request data
    FE->>+API: GET /api/data
    API->>+Cache: Check cache
    Cache-->>-API: Hit
    API-->>-FE: Cached data
    FE-->>-User: Display`,
  },
  flowchartStyles: {
    label: 'Styled Flowchart',
    code: `graph TD
    A([Start]) --> B[\\Input Data/]
    B --> C{Validate}
    C -->|Pass| D[[Process]]
    C -->|Fail| E>Error Log]
    D --> F[(Database)]
    D --> G{{Transform}}
    G --> H[/Report\\\\]
    E --> B
    F --> I((End))
    H --> I
    style A fill:#2ecc71,color:#fff
    style I fill:#e74c3c,color:#fff
    style D fill:#3498db,color:#fff
    style F fill:#9b59b6,color:#fff
    style C fill:#f39c12,color:#fff`,
  },
  zenuml: {
    label: 'ZenUML',
    code: `zenuml
    title Order Service
    @Actor Client
    @Boundary OrderController
    @Entity OrderService

    Client->OrderController.create() {
        OrderService.validate()
        OrderService.save()
    }`,
  },
  swimlane: {
    label: 'Swimlane Flowchart',
    code: `graph TB
    subgraph Customer
        A[Place Order] --> B[Make Payment]
    end
    subgraph Sales Team
        B --> C[Verify Payment]
        C --> D{Approved?}
        D -->|Yes| E[Confirm Order]
        D -->|No| F[Reject Order]
    end
    subgraph Warehouse
        E --> G[Pick Items]
        G --> H[Pack Order]
    end
    subgraph Shipping
        H --> I[Ship Order]
        I --> J[Deliver to Customer]
    end
    F --> A`,
  },
  ganttAdvanced: {
    label: 'Gantt (Advanced)',
    code: `gantt
    dateFormat  YYYY-MM-DD
    title       Adding GANTT diagram functionality to mermaid
    excludes    weekends
    section A section
    Completed task            :done,    des1, 2014-01-06,2014-01-08
    Active task               :active,  des2, 2014-01-09, 3d
    Future task               :         des3, after des2, 5d
    Future task2              :         des4, after des3, 5d
    section Critical tasks
    Completed task in the critical line :crit, done, 2014-01-06,24h
    Implement parser and jison          :crit, done, after des1, 2d
    Create tests for parser             :crit, active, 3d
    Future task in critical line        :crit, 5d
    Create tests for renderer           :2d
    Add to mermaid                      :until isadded
    Functionality added                 :milestone, isadded, 2014-01-25, 0d
    section Documentation
    Describe gantt syntax               :active, a1, after des1, 3d
    Add gantt diagram to demo page      :after a1  , 20h
    Add another diagram to demo page    :doc1, after a1  , 48h
    section Last section
    Describe gantt syntax               :after doc1, 3d
    Add gantt diagram to demo page      :20h
    Add another diagram to demo page    :48h`,
  },
  zenumlTryCatch: {
    label: 'ZenUML (Try/Catch)',
    code: `zenuml
    try {
      Consumer->API: Book something
      API->BookingService: Start booking process
    } catch {
      API->Consumer: show failure
    } finally {
      API->BookingService: rollback status
    }`,
  },
  architectureAdv: {
    label: 'Architecture (Advanced)',
    code: `architecture-beta
    service left_disk(disk)[Disk]
    service top_disk(disk)[Disk]
    service bottom_disk(disk)[Disk]
    service top_gateway(internet)[Gateway]
    service bottom_gateway(internet)[Gateway]
    junction junctionCenter
    junction junctionRight
    left_disk:R -- L:junctionCenter
    top_disk:B -- T:junctionCenter
    bottom_disk:T -- B:junctionCenter
    junctionCenter:R -- L:junctionRight
    top_gateway:B -- T:junctionRight
    bottom_gateway:T -- B:junctionRight`,
  },
  azureArch: {
    label: 'Azure Architecture',
    code: `architecture-beta
    group azure(cloud)[Azure Cloud]
    service apim(internet)[API Management] in azure
    service func(server)[Functions] in azure
    service aks(server)[AKS Cluster] in azure
    service sql(database)[SQL Database] in azure
    service cosmos(database)[Cosmos DB] in azure
    service blob(disk)[Blob Storage] in azure
    service sb(server)[Service Bus] in azure

    apim:R --> L:aks
    apim:B --> T:func
    aks:B --> T:sql
    aks:R --> L:cosmos
    func:B --> T:blob
    aks:R --> L:sb
    sb:B --> T:func`,
  },
  awsArch: {
    label: 'AWS Architecture',
    code: `architecture-beta
    group aws(cloud)[AWS Cloud]

    service ec2(server)[EC2 Server] in aws
    service rds(database)[RDS Database] in aws
    service s3(disk)[S3 Storage] in aws
    service glacier(disk)[Glacier] in aws
    service lambda(server)[Lambda] in aws

    ec2:R -- L:rds
    lambda:T -- B:ec2
    s3:T -- B:rds
    glacier:T -- B:ec2`,
  },
  iconGuide: {
    label: 'Icon Guide (All Icons)',
    code: `architecture-beta
    %% All 5 built-in icons + group icon
    %% Icons: cloud, database, disk, internet, server
    %% Use junction nodes to avoid edge overlaps

    group infra(cloud)[Infrastructure]

    service web(internet)[Internet Gateway] in infra
    service app(server)[App Server] in infra
    service db(database)[Database] in infra
    service storage(disk)[File Storage] in infra
    service backup(cloud)[Cloud Backup] in infra

    %% Use junctions to route edges cleanly
    junction hub

    web:R --> L:app
    app:R --> L:hub
    hub:R --> L:db
    hub:B --> T:storage
    storage:R --> L:backup`,
  },
};
