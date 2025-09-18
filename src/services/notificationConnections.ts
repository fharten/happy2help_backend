// services/notificationConnections.ts
import type { Response } from 'express';

type ConnectionRegistry = { [key: string]: Response[] };

const userNotificationConnections: ConnectionRegistry = Object.create(null);
const ngoNotificationConnections: ConnectionRegistry = Object.create(null);

function addConnection(registry: ConnectionRegistry, key: string, response: Response): () => void {
  if (!registry[key]) registry[key] = [];
  registry[key].push(response);

  // Cleanup-Funktion für genau diese Response
  return () => {
    const listForKey = registry[key];
    if (!listForKey) return;
    const indexOfResponse = listForKey.indexOf(response);
    if (indexOfResponse !== -1) listForKey.splice(indexOfResponse, 1);
    if (listForKey.length === 0) delete registry[key];
  };
}

function sendEvent(
  registry: ConnectionRegistry,
  key: string,
  eventName: string,
  payload: unknown
): void {
  const listForKey = registry[key];
  if (!listForKey || listForKey.length === 0) return;

  const serialized = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;

  // An alle offenen Verbindungen des Empfängers senden
  for (let index = 0; index < listForKey.length; index++) {
    const response = listForKey[index];
    try {
      response.write(serialized);
    } catch {
      // Bei Schreibfehler Verbindung aus der Liste entfernen
      const failureIndex = listForKey.indexOf(response);
      if (failureIndex !== -1) listForKey.splice(failureIndex, 1);
    }
  }
  if (listForKey.length === 0) delete registry[key];
}

export const notificationConnections = {
  addUser(userId: string, response: Response): () => void {
    return addConnection(userNotificationConnections, userId, response);
  },
  addNgo(ngoId: string, response: Response): () => void {
    return addConnection(ngoNotificationConnections, ngoId, response);
  },
  sendToUser(userId: string, eventName: string, payload: unknown): void {
    sendEvent(userNotificationConnections, userId, eventName, payload);
  },
  sendToNgo(ngoId: string, eventName: string, payload: unknown): void {
    sendEvent(ngoNotificationConnections, ngoId, eventName, payload);
  },
};
