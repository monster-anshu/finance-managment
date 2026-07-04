import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

import * as schema from "./schema";

export const DATABASE_NAME = "finance.db";

const expoDb = openDatabaseSync(DATABASE_NAME, { enableChangeListener: false });

export const db = drizzle(expoDb, { schema });
