import React from 'react'
import { Helmet } from 'react-helmet'
import { INTRO_ASSETS } from './constants'

/**
 * Injects <link rel="preload"> tags for heavy intro-specific assets so they
 * start loading while JS bundles parse. Uses react-helmet so tags are added to
 * <head> even in CSR.
 */
export const AssetsPreloader: React.FC = () => (
  <Helmet>
    {INTRO_ASSETS.map(({ href, as, type }) => (
      <link key={href} rel="preload" as={as} href={href} type={type} />
    ))}
  </Helmet>
) 