import * as path from 'path';

import { addTrailingSlash, emptyObj } from '../util';
import {
  getCopyWebpackPlugin,
  getCssoWebpackPlugin,
  getDefinePlugin,
  getDevtool,
  getEntry,
  getHtmlWebpackPlugin,
  getMiniCssExtractPlugin,
  getModule,
  getOutput,
  getUglifyPlugin,
  processEnvOption
} from '../util/chain';
import { BuildConfig } from '../util/types';
import getBaseChain from './base.conf';

export default function (appPath: string, config: Partial<BuildConfig>): any {
  const chain = getBaseChain(appPath)
  const {
    alias = emptyObj,
    copy,
    entry = emptyObj,
    output = emptyObj,
    sourceRoot = '',
    outputRoot = 'dist',
    publicPath = '',
    staticDirectory = 'static',
    chunkDirectory = 'chunk',

    designWidth = 750,
    deviceRatio,
    enableSourceMap = false,
    enableExtract = true,

    defineConstants = emptyObj,
    env = emptyObj,
    styleLoaderOption = emptyObj,
    cssLoaderOption = emptyObj,
    sassLoaderOption = emptyObj,
    lessLoaderOption = emptyObj,
    stylusLoaderOption = emptyObj,
    mediaUrlLoaderOption = emptyObj,
    fontUrlLoaderOption = emptyObj,
    imageUrlLoaderOption = emptyObj,

    miniCssExtractPluginOption = emptyObj,
    esnextModules = [],

    postcss,
    babel,
    csso,
    uglify
  } = config

  const plugin: any = {}

  if (enableExtract) {
    plugin.miniCssExtractPlugin = getMiniCssExtractPlugin([{
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].css'
    }, miniCssExtractPluginOption])
  }

  if (copy) {
    plugin.copyWebpackPlugin = getCopyWebpackPlugin({ copy, appPath })
  }

  plugin.htmlWebpackPlugin = getHtmlWebpackPlugin([{
    filename: 'index.html',
    template: path.join(appPath, sourceRoot, 'index.html')
  }])

  plugin.definePlugin = getDefinePlugin([processEnvOption(env), defineConstants])

  const isCssoEnabled = (csso && csso.enable === false)
    ? false
    : true

  if (isCssoEnabled) {
    plugin.cssoWebpackPlugin = getCssoWebpackPlugin([csso ? csso.config : {}])
  }

  const mode = 'production'

  const minimizer: any[] = []
  const isUglifyEnabled = (uglify && uglify.enable === false)
    ? false
    : true

  if (isUglifyEnabled) {
    minimizer.push(getUglifyPlugin([
      enableSourceMap,
      uglify ? uglify.config : {}
    ]))
  }

  chain.merge({
    mode,
    devtool: getDevtool(enableSourceMap),
    entry: getEntry(entry),
    output: getOutput(appPath, [{
      outputRoot,
      publicPath: addTrailingSlash(publicPath),
      chunkDirectory
    }, output]),
    resolve: { alias },
    module: getModule(appPath, {
      designWidth,
      deviceRatio,
      enableExtract,
      enableSourceMap,

      styleLoaderOption,
      cssLoaderOption,
      lessLoaderOption,
      sassLoaderOption,
      stylusLoaderOption,
      fontUrlLoaderOption,
      imageUrlLoaderOption,
      mediaUrlLoaderOption,
      esnextModules,

      postcss,
      babel,
      staticDirectory
    }),
    plugin,
    optimization: {
      minimizer,
      splitChunks: {
        name: false
      }
    }
  })
  return chain
}
