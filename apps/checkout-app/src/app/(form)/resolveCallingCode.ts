import type { CountryInfo } from '../../api/fetchCountryInfoList.ts';
import { i18n } from '@lingui/core';

const ccData = "US1,CN86,CA1,DE49,GB44,JP81,KR82,AU61,FR33,SG65,NL31,CH41,SE46,NO47,FI358,DK45,NZ64,IL972,EE372,BE32,AT43,IE353,IT39,ES34,PT351,LU352,CZ420,PL48,GR30,HU36,LT370,LV371,SI386,SK421,BG359,RO40,HR385,CY357,MT356,IS354,HK852,TW886,AE971,QA974,SA966,KW965,MY60,TH66,RU7,TR90,KE254,IN91,BR55,MX52,AR54,CL56,ZA27,NG234,EG20,MA212,PK92,BD880,PH63,VN84,ID62,CO57,PE51,VE58,SA966,IQ964,SY963,JO962,LB961,OM968,BH973,YE967,KZ7,UZ998,TM993,KG996,TJ992,AM374,AZ994,GE995,MN976,LK94,MV960,NP977,BT975,AF93,MM95,KH855,LA856,BN673,TL670,PG675,FJ679,SB677,VU678,WS685,TO676,PW680,FM691,MH692,KI686,NR674,TV688,BD880,LK94,MV960,NP977,BT975,AF93,IQ964,SY963,JO962,LB961,OM968,BH973,YE967,UG256,TZ255,ZM260,SL232,UY598,UM1,PR1,GU1,MP1,JM1,DO1,CR506,SV503,GT502,TT1,PA507,GY592,SR597,LC1,KN1,BS1,BB1,BZ501,AI1,AG1,GD1,DM1,MS1,GL299,GP590,MQ596,KY1,AW297,BM1,BQ599,CW599,SX1,AS1,FK500,GF594,TF262,MO853,PS970,AX358,AD376,BA387,GI350,FO298,LI423,ME382,SM378,VA39,SJ47,XK383,DZ213,AO244,BJ229,BW267,BF226,BI257,CM237,CV238,TD235,KM269,CG242,CI225,DJ253,GQ240,ER291,ET251,GA241,GM220,GH233,GN224,LS266,LR231,MG261,MW265,MR222,MU230,YT262,MZ258,NA264,NE227,RE262,RW250,SH290,ST239,SN221,SC248,SZ268,TG228,TN216,EH212,CX61,CC61,CK682,PF689,NC687,NU683,NF672,PN64,BV47,HM672,AQ672"
const countryCallingCodeMap = new Map(ccData.split(",").map(it => [it.slice(0, 2), it.slice(2)]));
type CountryCallingCode = {
  name: string;
  iso2Code: string;
  callingCode: string;
}
let cache: CountryCallingCode[] | undefined;
const resolveCallingCode = (countries: CountryInfo[]) => {
  if (cache) {
    return cache;
  }
  const countryName = new Map(countries.map(country => [country.iso2Code, i18n.locale === 'zh' ? country?.countryNameCn : country?.countryNameEn]));
  const callingCodes = Array.from(countryCallingCodeMap.entries())
    .map(([iso2Code, callingCode]) => ({
      name: countryName.get(iso2Code)!,
      iso2Code,
      callingCode,
    }))
    .filter(it => !!it.name);
  if (countries?.length > 1) {
    cache = callingCodes;
  }
  return callingCodes;
}
export default resolveCallingCode;
