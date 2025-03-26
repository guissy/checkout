import { useEffect, useState } from 'react';
import fetchCountryInfoList, { CountryInfo } from '../../../api/fetchCountryInfoList';

interface UseCountryInfoProps {
  supportedCountries: string[];
  initialCountryCode?: string;
}

interface UseCountryInfoReturn {
  countries: CountryInfo[];
  country: CountryInfo | undefined;
  setCountry: (country: CountryInfo | ((prev: CountryInfo | undefined) => CountryInfo | undefined)) => void;
}

export function useCountryInfo({ supportedCountries, initialCountryCode }: UseCountryInfoProps): UseCountryInfoReturn {
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [country, setCountry] = useState<CountryInfo | undefined>();

  useEffect(() => {
    const loadCountries = async () => {
      const countriesRes = await fetchCountryInfoList();
      const countries = Array.isArray(countriesRes?.data) ? countriesRes?.data : [] as CountryInfo[];
      console.info('load countries raw:', countries?.length);

      const countriesOk = countries.filter((it) => supportedCountries.includes(it.iso2Code));
      console.info('load countries ok:', countriesOk?.length);

      setCountries(countries);
      const country = countries?.find(item => item.iso2Code === initialCountryCode);
      setCountry(prev => prev || country || (initialCountryCode ? { iso2Code: initialCountryCode } as CountryInfo : undefined));
    };

    loadCountries();
  }, [supportedCountries, initialCountryCode]);

  return { countries, country, setCountry };
}
