# nestjs-formdata

`nestjs-formdata` is a powerful library for NestJS that provides seamless interception and handling of multipart/form-data requests. This functionality is particularly beneficial for efficiently managing file uploads in your application. Note that this library is compatible only with the Express platform.

## Getting Started

### Installation

To install `nestjs-formdata` using npm (COMING SOON):

```sh
npm install nestjs-formdata
```

### Usage

To use `nestjs-formdata`, import it into the main directory of your NestJS application and configure it as shown below:

```ts
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { FormdataInterceptor, DefaultFileSaver } from "nestjs-formdata";

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
import { FileData, IFileSaver } from "nestjs-formdata";
import { ExecutionContext } from "@nestjs/common";

export class CustomFileSaver implements IFileSaver {
  public save(
    fileData: FileData,
    context: ExecutionContext
  ): string | Promise<string> {
    // do your file save logic
    // and return the string value of your file url
  }
}
```

Then, use your custom file saver in the interceptor configuration:

```ts
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { FormdataInterceptor } from "nestjs-formdata";
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

If you are using `class-validator` describe dto and specify validation rules

```ts
import { IsArray, IsNotEmpty } from "class-validator";
import {
  FileData,
  HasMimeType,
  IsFileData,
  MaxFileSize,
  MimeType,
  MinFileSize,
} from "nestjs-formdata";

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
  getHello(@Body() createDto: CreateDto) {
    // save single file
    createDto.file.save();

    // save multiple file
    createDto.files.map((file) => file.save());
  }
}
```

With this setup, `nestjs-formdata` will manage multipart/form-data requests efficiently, allowing for structured handling of file uploads in your NestJS application.

## License

[MIT](LICENSE)
