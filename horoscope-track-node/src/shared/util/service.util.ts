import axios from 'axios';
import yaml from 'yaml';
import * as fs from 'fs';

export class ServiceUtil {
  async fetchDataFromGraphQL(
    query: any,
    endpoint?: any,
    method?: string,
  ): Promise<any> {
    try {
      console.log(`Fetching data from: ${endpoint}`);
      const response = await axios({
        url: endpoint,
        method: method,
        data: query,
        timeout: 30000,
      });

      if (response.data?.errors?.length > 0) {
        console.log(
          response.data.errors,
          `Error while querying from graphql! ${JSON.stringify(response.data)}`,
        );
        return null;
      }

      return response.data;
    } catch (error) {
      console.log(query, `1Error while querying from graphql! ${error}`);
      return null;
    }
  }

  async getManifestData(manifestPath: string) {
    const file = fs.readFileSync(manifestPath, 'utf8');
    return yaml.parse(file);
  }
}
