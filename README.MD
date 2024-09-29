# nestjs-formdata-interceptor

`nestjs-formdata-interceptor` is a powerful library for [NestJS](https://docs.nestjs.com/) that provides seamless interception and handling of multipart/form-data requests. This functionality is particularly beneficial for efficiently managing file uploads in your application.

## Getting Started

### Installation

To install `nestjs-formdata-interceptor` using npm:

```sh
npm install nestjs-formdata-interceptor
```

### OR using yarn

```sh
yarn add nestjs-formdata-interceptor
```

### Usage

To use `nestjs-formdata-interceptor`, import it into the main directory of your NestJS application and configure it as shown below:

```ts
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import {
  FormdataInterceptor,
  DefaultFileSaver,
} from "nestjs-formdata-interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(
    new FormdataInterceptor({
      customFileName(context, originalFileName) {
        return `${Date.now()}-${originalFileName}`;
      },
      fileSaver: new DefaultFileSaver({
        prefixDirectory: "./public",
        customDirectory(context, originalDirectory) {
          return originalDirectory;
        },
      }),
    })
  );

  await app.listen(3000);
}
bootstrap();
```

### Fastify

need to install [`@fastify/multipart`](https://www.npmjs.com/package/@fastify/multipart) package.

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import fastifyMultipart from "@fastify/multipart";
import {
  DefaultFileSaver,
  FormdataInterceptor,
} from "nestjs-formdata-interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  app.register(fastifyMultipart);

  app.useGlobalInterceptors(
    new FormdataInterceptor({
      customFileName(context, originalFileName) {
        return `${Date.now()}-${originalFileName}`;
      },
      fileSaver: new DefaultFileSaver({
        prefixDirectory: "./public",
        customDirectory(context, originalDirectory) {
          return originalDirectory;
        },
      }),
    })
  );

  await app.listen(3000);
}
bootstrap();
```

### OR

you can use route spesific interceptor

```ts
import { Body, Controller, Post, UseInterceptors } from "@nestjs/common";
import { AppService } from "./app.service";
import { CreateDto } from "./dto/create.dto";
import { FormdataInterceptor } from "nestjs-formdata-interceptor";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @UseInterceptors(new FormdataInterceptor())
  getHello(@Body() createDto: CreateDto) {
    // your controller logic
  }
}
```

### Explanation

#### 1. Custom File Name:

The `customFileName` function allows you to generate custom file names for each uploaded file. In the example above, the file name is prefixed with the current timestamp followed by the original file name.

#### 2. File Saver:

- The `DefaultFileSaver` is used to define the directory where the files will be saved.

  - `prefixDirectory` specifies the root directory where all files will be saved.
  - `customDirectory` allows you to specify a custom sub-directory within the root directory. By default, it uses the original directory provided.

### Custom File Saver

If you need custom file-saving logic, implement the IFileSaver interface. Here's an example:

```ts
import { FileData, IFileSaver } from "nestjs-formdata-interceptor";
import { ExecutionContext } from "@nestjs/common";

export class CustomFileSaver implements IFileSaver {
  public save(
    fileData: FileData,
    context: ExecutionContext,
    args: unknown // this will be get from save method payload
  ): any {
    // do your file save logic
    // and return the file save data
  }
}
```

Then, use your custom file saver in the interceptor configuration:

```ts
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { FormdataInterceptor } from "nestjs-formdata-interceptor";
import { CustomFileSaver } from "path-to-your-file-saver";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(
    new FormdataInterceptor({
      customFileName(context, originalFileName) {
        return `${Date.now()}-${originalFileName}`;
      },
      fileSaver: new CustomFileSaver(),
    })
  );

  await app.listen(3000);
}
bootstrap();
```

### File Validation

If you are using [`class-validator`](https://www.npmjs.com/package/class-validator) describe dto and specify validation rules

```ts
import { IsArray, IsNotEmpty } from "class-validator";
import {
  FileData,
  HasMimeType,
  IsFileData,
  MaxFileSize,
  MimeType,
  MinFileSize,
} from "nestjs-formdata-interceptor";

export class CreateDto {
  @IsArray()
  @IsNotEmpty()
  @IsFileData({ each: true })
  @HasMimeType([MimeType["video/mp4"], "image/png"], { each: true })
  @MinFileSize(2000000, { each: true })
  @MaxFileSize(4000000, { each: true })
  // array file
  files: FileData[];

  @IsFileData()
  @IsNotEmpty()
  @HasMimeType([MimeType["video/mp4"], "image/png"])
  @MinFileSize(2000000)
  @MaxFileSize(4000000)
  // single file
  file: FileData;

  @IsFileData()
  @IsNotEmpty()
  @HasMimeType([MimeType["video/mp4"], "image/png"])
  @MinFileSize(2000000)
  @MaxFileSize(4000000)
  /**
   * customize file data save method
   * @param args [string] the payload sent to the custom file saver
   * @returns [Promise<string>] the file path where the file was saved
   * */
  customizeFileData: FileData<Promise<string>, string>;
}
```

### Controller

Define your controller to handle file uploads:

```ts
import { Body, Controller, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { CreateDto } from "./dto/create.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async getHello(@Body() createDto: CreateDto) {
    // save single file
    createDto.file.save(); // by default the file save data type is string

    // save multiple file
    createDto.files.map((file) => file.save()); // by default the file save data type is string

    // customize file data example
    await createDto.customizeFileData.save("bucket_name"); // it will be returning Promise<string>
  }
}
```

With this setup, `nestjs-formdata-interceptor` will manage multipart/form-data requests efficiently, allowing for structured handling of file uploads in your NestJS application.

## Contributors

<a href="https://github.com/h3llmy/nest-formdata/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=h3llmy/nest-formdata" />
</a>

## License

[MIT](LICENSE)
