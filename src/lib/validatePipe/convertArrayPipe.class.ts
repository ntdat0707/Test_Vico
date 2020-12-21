import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ConvertArray implements PipeTransform<any> {
  async transform(value: string[]): Promise<string[]> {
    let arrId: string[] = [];
    if (value && typeof value === 'string') {
      arrId.push(value);
    } else {
      arrId = value;
    }
    return arrId;
  }
}
