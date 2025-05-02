import { parse, isValid } from 'date-fns';

export default function parseDateWithDateFns(dateString: string): Date | null {
  if (!dateString) {
    return null;
  }

  const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());

  if (!isValid(parsedDate)) {
    return null;
  }

  return parsedDate;
}
