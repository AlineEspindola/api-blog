import { Text } from '../../text/Text';

export interface Comment {
  getText(): Text;
  add(comment: Comment): void;
  getChildren(): Comment[];
}