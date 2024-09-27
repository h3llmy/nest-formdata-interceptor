import { ExecutionContext } from "@nestjs/common";
import { FileData } from "../classes/FileData";
/**
 * Enum for the mime types.
 */
export enum MimeType {
  "application/*" = "application/*",
  "image/*" = "image/*",
  "audio/*" = "audio/*",
  "text/*" = "text/*",
  "video/*" = "video/*",
  "application/andrew-inset" = "application/andrew-inset",
  "application/applixware" = "application/applixware",
  "application/atom+xml" = "application/atom+xml",
  "application/atomcat+xml" = "application/atomcat+xml",
  "application/atomsvc+xml" = "application/atomsvc+xml",
  "application/ccxml+xml" = "application/ccxml+xml",
  "application/cdmi-capability" = "application/cdmi-capability",
  "application/cdmi-container" = "application/cdmi-container",
  "application/cdmi-domain" = "application/cdmi-domain",
  "application/cdmi-object" = "application/cdmi-object",
  "application/cdmi-queue" = "application/cdmi-queue",
  "application/cu-seeme" = "application/cu-seeme",
  "application/dash+xml" = "application/dash+xml",
  "application/davmount+xml" = "application/davmount+xml",
  "application/docbook+xml" = "application/docbook+xml",
  "application/dssc+der" = "application/dssc+der",
  "application/dssc+xml" = "application/dssc+xml",
  "application/ecmascript" = "application/ecmascript",
  "application/emma+xml" = "application/emma+xml",
  "application/epub+zip" = "application/epub+zip",
  "application/exi" = "application/exi",
  "application/font-tdpfr" = "application/font-tdpfr",
  "application/gml+xml" = "application/gml+xml",
  "application/gpx+xml" = "application/gpx+xml",
  "application/gxf" = "application/gxf",
  "application/hyperstudio" = "application/hyperstudio",
  "application/inkml+xml" = "application/inkml+xml",
  "application/ipfix" = "application/ipfix",
  "application/java-archive" = "application/java-archive",
  "application/java-serialized-object" = "application/java-serialized-object",
  "application/java-vm" = "application/java-vm",
  "application/javascript" = "application/javascript",
  "application/json" = "application/json",
  "application/jsonml+json" = "application/jsonml+json",
  "application/lost+xml" = "application/lost+xml",
  "application/mac-binhex40" = "application/mac-binhex40",
  "application/mac-compactpro" = "application/mac-compactpro",
  "application/mads+xml" = "application/mads+xml",
  "application/marc" = "application/marc",
  "application/marcxml+xml" = "application/marcxml+xml",
  "application/mathematica" = "application/mathematica",
  "application/mathml+xml" = "application/mathml+xml",
  "application/mbox" = "application/mbox",
  "application/mediaservercontrol+xml" = "application/mediaservercontrol+xml",
  "application/metalink+xml" = "application/metalink+xml",
  "application/metalink4+xml" = "application/metalink4+xml",
  "application/mets+xml" = "application/mets+xml",
  "application/mods+xml" = "application/mods+xml",
  "application/mp21" = "application/mp21",
  "application/mp4" = "application/mp4",
  "application/msword" = "application/msword",
  "application/mxf" = "application/mxf",
  "application/octet-stream" = "application/octet-stream",
  "application/oda" = "application/oda",
  "application/oebps-package+xml" = "application/oebps-package+xml",
  "application/ogg" = "application/ogg",
  "application/omdoc+xml" = "application/omdoc+xml",
  "application/onenote" = "application/onenote",
  "application/oxps" = "application/oxps",
  "application/patch-ops-error+xml" = "application/patch-ops-error+xml",
  "application/pdf" = "application/pdf",
  "application/pgp-encrypted" = "application/pgp-encrypted",
  "application/pgp-signature" = "application/pgp-signature",
  "application/pics-rules" = "application/pics-rules",
  "application/pkcs10" = "application/pkcs10",
  "application/pkcs7-mime" = "application/pkcs7-mime",
  "application/pkcs7-signature" = "application/pkcs7-signature",
  "application/pkcs8" = "application/pkcs8",
  "application/pkix-attr-cert" = "application/pkix-attr-cert",
  "application/pkix-cert" = "application/pkix-cert",
  "application/pkix-crl" = "application/pkix-crl",
  "application/pkix-pkipath" = "application/pkix-pkipath",
  "application/pls+xml" = "application/pls+xml",
  "application/postscript" = "application/postscript",
  "application/prs.cww" = "application/prs.cww",
  "application/pskc+xml" = "application/pskc+xml",
  "application/rdf+xml" = "application/rdf+xml",
  "application/reginfo+xml" = "application/reginfo+xml",
  "application/relax-ng-compact-syntax" = "application/relax-ng-compact-syntax",
  "application/resource-lists+xml" = "application/resource-lists+xml",
  "application/resource-lists-diff+xml" = "application/resource-lists-diff+xml",
  "application/rls-services+xml" = "application/rls-services+xml",
  "application/rss+xml" = "application/rss+xml",
  "application/rtf" = "application/rtf",
  "application/sbml+xml" = "application/sbml+xml",
  "application/scvp-cv-request" = "application/scvp-cv-request",
  "application/scvp-cv-response" = "application/scvp-cv-response",
  "application/scvp-vp-request" = "application/scvp-vp-request",
  "application/scvp-vp-response" = "application/scvp-vp-response",
  "application/sdp" = "application/sdp",
  "application/set-payment-initiation" = "application/set-payment-initiation",
  "application/set-registration-initiation" = "application/set-registration-initiation",
  "application/shf+xml" = "application/shf+xml",
  "application/smil+xml" = "application/smil+xml",
  "application/sparql-query" = "application/sparql-query",
  "application/sparql-results+xml" = "application/sparql-results+xml",
  "application/srgs" = "application/srgs",
  "application/srgs+xml" = "application/srgs+xml",
  "application/sru+xml" = "application/sru+xml",
  "application/ssml+xml" = "application/ssml+xml",
  "application/tei+xml" = "application/tei+xml",
  "application/thraud+xml" = "application/thraud+xml",
  "application/timestamped-data" = "application/timestamped-data",
  "application/vnd.3gpp.pic-bw-large" = "application/vnd.3gpp.pic-bw-large",
  "application/vnd.3gpp.pic-bw-small" = "application/vnd.3gpp.pic-bw-small",
  "application/vnd.3gpp.pic-bw-var" = "application/vnd.3gpp.pic-bw-var",
  "application/vnd.3gpp2.tcap" = "application/vnd.3gpp2.tcap",
  "application/vnd.3m.post-it-notes" = "application/vnd.3m.post-it-notes",
  "application/vnd.accpac.simply.aso" = "application/vnd.accpac.simply.aso",
  "application/vnd.accpac.simply.imp" = "application/vnd.accpac.simply.imp",
  "application/vnd.acucobol" = "application/vnd.acucobol",
  "application/vnd.acucorp" = "application/vnd.acucorp",
  "application/vnd.adobe.air-application-installer-package+zip" = "application/vnd.adobe.air-application-installer-package+zip",
  "application/vnd.adobe.formscentral.fcdt" = "application/vnd.adobe.formscentral.fcdt",
  "application/vnd.adobe.fxp" = "application/vnd.adobe.fxp",
  "application/vnd.adobe.xdp+xml" = "application/vnd.adobe.xdp+xml",
  "application/vnd.adobe.xfdf" = "application/vnd.adobe.xfdf",
  "application/vnd.ahead.space" = "application/vnd.ahead.space",
  "application/vnd.airzip.filesecure.azf" = "application/vnd.airzip.filesecure.azf",
  "application/vnd.airzip.filesecure.azs" = "application/vnd.airzip.filesecure.azs",
  "application/vnd.amazon.ebook" = "application/vnd.amazon.ebook",
  "application/vnd.americandynamics.acc" = "application/vnd.americandynamics.acc",
  "application/vnd.amiga.ami" = "application/vnd.amiga.ami",
  "application/vnd.android.package-archive" = "application/vnd.android.package-archive",
  "application/vnd.anser-web-certificate-issue-initiation" = "application/vnd.anser-web-certificate-issue-initiation",
  "application/vnd.anser-web-funds-transfer-initiation" = "application/vnd.anser-web-funds-transfer-initiation",
  "application/vnd.antix.game-component" = "application/vnd.antix.game-component",
  "application/vnd.apple.installer+xml" = "application/vnd.apple.installer+xml",
  "application/vnd.apple.mpegurl" = "application/vnd.apple.mpegurl",
  "application/vnd.aristanetworks.swi" = "application/vnd.aristanetworks.swi",
  "application/vnd.astraea-software.iota" = "application/vnd.astraea-software.iota",
  "application/vnd.audiograph" = "application/vnd.audiograph",
  "application/vnd.blueice.multipass" = "application/vnd.blueice.multipass",
  "application/vnd.bmi" = "application/vnd.bmi",
  "application/vnd.businessobjects" = "application/vnd.businessobjects",
  "application/vnd.chemdraw+xml" = "application/vnd.chemdraw+xml",
  "application/vnd.chipnuts.karaoke-mmd" = "application/vnd.chipnuts.karaoke-mmd",
  "application/vnd.cinderella" = "application/vnd.cinderella",
  "application/vnd.claymore" = "application/vnd.claymore",
  "application/vnd.cloanto.rp9" = "application/vnd.cloanto.rp9",
  "application/vnd.clonk.c4group" = "application/vnd.clonk.c4group",
  "application/vnd.cluetrust.cartomobile-config" = "application/vnd.cluetrust.cartomobile-config",
  "application/vnd.cluetrust.cartomobile-config-pkg" = "application/vnd.cluetrust.cartomobile-config-pkg",
  "application/vnd.commonspace" = "application/vnd.commonspace",
  "image/jpeg" = "image/jpeg",
  "image/png" = "image/png",
  "image/gif" = "image/gif",
  "image/bmp" = "image/bmp",
  "image/webp" = "image/webp",
  "image/svg+xml" = "image/svg+xml",
  "video/mp4" = "video/mp4",
  "video/mpeg" = "video/mpeg",
  "video/webm" = "video/webm",
  "video/quicktime" = "video/quicktime",
  "video/x-msvideo" = "video/x-msvideo",
  "video/x-ms-wmv" = "video/x-ms-wmv",
  "audio/mpeg" = "audio/mpeg",
  "audio/ogg" = "audio/ogg",
  "audio/wav" = "audio/wav",
  "audio/webm" = "audio/webm",
  "audio/midi" = "audio/midi",
  "text/plain" = "text/plain",
  "text/html" = "text/html",
}

/**
 * Interface for saving file data.
 */
export interface IFileSaver {
  /**
   * Saves the provided file data to the specified file path.
   * @param fileData - The file data to save.
   * @param context - The execution context, typically provided by NestJS.
   * @returns The file path where the file was saved.
   */
  save(fileData: FileData, context: ExecutionContext, args?: unknown): any;
}

/**
 * Options for customizing file upload behavior.
 */
export interface IFileOptions {
  /**
   * Function to customize the file name.
   * @param context - The execution context, typically provided by NestJS.
   * @param originalFileName - The original file name.
   * @returns The customized file name.
   */
  customFileName?: (
    context: ExecutionContext,
    originalFileName: string
  ) => Promise<string> | string;
  /**
   * Custom file saver implementation.
   */
  fileSaver?: IFileSaver;
}

/**
 * Options for customizing behavior of the DefaultFileSaver.
 */
export interface DefaultFileSaverOptions {
  /**
   * Prefix directory where files will be saved.
   */
  prefixDirectory?: string;
  /**
   * Function to customize the directory where files will be saved.
   * @param context - The execution context, typically provided by NestJS.
   * @param originalDirectory - The original directory.
   * @returns The customized directory.
   */
  customDirectory?: (
    context: ExecutionContext,
    originalDirectory: string
  ) => string;
}
