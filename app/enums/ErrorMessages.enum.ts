export enum ErrorMessagesEnum {
  PASSWORD_ERROR = 'password is not strong enough',
  CPF_FROM_OTHER_USER = 'CPF provided is already linked to other email address.',
  EMAIL_FROM_OTHER_USER = 'Email provided is already linked to other CPF.',
  EMAIL_FROM_INSTITUTION = 'Email provided already exists as an institution.',
  CHILD_ID_NOT_FOUND = 'Child Id provided does not exist.',
  RESPONSIBLE_ALREADY_LINKED_TO_CHILD = 'This responsible is already linked to this child.',
  CPF_FROM_A_CHILD = 'CPF from a child is not allowed to register as a responsible.',
}
