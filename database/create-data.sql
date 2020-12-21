CREATE DATABASE "mi_dom"
    WITH OWNER "postgres"
    ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE template0;
\c mi_dom
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";