import { atom, map } from 'nanostores';

export const chatStore = map({
  started: false,
  aborted: false,
  showChat: true,
});

/**
 * Global edit-message state.
 *
 * When `isEditing` is true the UI enters "edit mode":
 *  - The bubble at `messageIndex` gets a dashed coloured border
 *  - The message `content` is filled into the chat input
 *  - A "cancel edit" button appears above the input box
 *
 * On send the messages are truncated to `messageIndex` and the new
 * content is appended as a fresh user message.
 */
export interface EditState {
  isEditing: boolean;
  /** Index in the messages array of the message being edited */
  messageIndex: number;
  /** Plain-text content of the message (metadata-stripped) */
  content: string;
}

export const editStore = atom<EditState>({
  isEditing: false,
  messageIndex: -1,
  content: '',
});

/** Helper: enter edit mode */
export function startEditing(messageIndex: number, content: string) {
  editStore.set({ isEditing: true, messageIndex, content });
}

/** Helper: leave edit mode without sending */
export function cancelEditing() {
  editStore.set({ isEditing: false, messageIndex: -1, content: '' });
}
