import { Comment } from './Comment';
import { Text } from '../../text/Text';

export class CommentReplied implements Comment {
  private children: Comment[] = [];
  private comment: Comment;

  constructor(comment: Comment) {
    this.comment = comment;
  }

  getText(): Text {
    return this.comment.getText();
  }

  add(comment: Comment): void {
    this.children.push(comment);
  }

  getChildren(): Comment[] {
    return this.children;
  }
}