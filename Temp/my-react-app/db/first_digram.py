import psycopg2
from graphviz import Digraph

# Database connection details
# db_config = {
#     'dbname': 'your_db_name',
#     'user': 'your_username',
#     'password': 'your_password',
#     'host': 'localhost',
#     'port': '5432'
# }

db_config = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mydatabase',
        'USER': 'ridoy',
        'PASSWORD': '654321',
        'HOST': 'localhost',
        'PORT': '',
    }
}

# Connect to the database
conn = psycopg2.connect(**db_config)
cursor = conn.cursor()

# Query to get tables and columns
cursor.execute('''
    SELECT
        c.table_name,
        c.column_name,
        c.data_type,
        tc.constraint_type,
        kcu.column_name AS fk_column,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
    FROM information_schema.columns c
    LEFT JOIN information_schema.key_column_usage kcu
        ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
    LEFT JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
    WHERE c.table_schema = 'public'
    ORDER BY c.table_name, c.ordinal_position;
''')

# Initialize a graph
g = Digraph('PostgreSQL_Database_Diagram', format='png')
tables = {}
relationships = []

# Process the results
for table_name, column_name, data_type, constraint_type, fk_column, referenced_table, referenced_column in cursor.fetchall():
    if table_name not in tables:
        tables[table_name] = []
    tables[table_name].append(f"{column_name} ({data_type})")

    # Track relationships for foreign keys
    if constraint_type == 'FOREIGN KEY':
        relationships.append((table_name, fk_column, referenced_table, referenced_column))

# Add tables to the graph
for table, columns in tables.items():
    label = f"{{ {table} | {'\\l'.join(columns)} }}"
    g.node(table, label=label, shape='record')

# Add relationships
for source_table, source_column, target_table, target_column in relationships:
    g.edge(source_table, target_table, label=f"{source_column} -> {target_column}")

# Save and render the diagram
g.render('database_diagram')

# Close the connection
cursor.close()
conn.close()

print("Database diagram generated as database_diagram.png")
