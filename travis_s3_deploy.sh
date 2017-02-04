deployprod() {
  sudo apt-get install s3cmd
  touch ~/.s3cfg
  export AWS_ACCESS_KEY_ID=$JUKOLA_AWS_KEY
  export AWS_SECRET_ACCESS_KEY=$JUKOLA_AWS_SECRET   
  s3cmd sync build/production/JukolaApp s3://jukolatest --acl-public --delete-removed
}

deployprod

#if [[ $TRAVIS_PULL_REQUEST != 'false' ]]; then
#  echo "This is a pull request. No deployment will be done."
#elif [[ $TRAVIS_BRANCH == 'master' ]]; then
#  echo "Going to deploy on master..."
#  deployprod
#else
#  echo "Nothing to do..."
#fi