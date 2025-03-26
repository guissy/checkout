import camelCase from 'lodash/camelCase';
import startCase from 'lodash/startCase';
import upperFirst from 'lodash/upperFirst';

export function camelToPascalWithSpaces(input: string): string {
  const match = input.match(/^[a-z]+$/);
  if (match) {
    return upperFirst(input);
  }
  if (!!match && Array.from(match).length > 1) {
    return input;
  }
  const camelCaseStr = camelCase(input);
  const startCaseStr = startCase(camelCaseStr);
  let name = startCaseStr.split(' ').map(upperFirst).join(' ');
  name = name.replace("Holder Name", "Fullname")
  name = name.replace("FirstName", "First Name")
  name = name.replace("LastName", "Last Name")
  name = name.replace("Nationalid", "National ID")
  name = name.replace(" Id", " ID")
  name = name.replace(" Ip", " IP")
  name = name.replace("Otp", "OTP")
  name = name.replace("Pin", "PIN")
  return name;
}